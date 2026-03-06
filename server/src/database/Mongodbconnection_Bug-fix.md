# MongoDB Direct Connection URL — Setup Guide in windows

> **Why this is needed:** On some Windows machines, Node.js cannot resolve MongoDB's `SRV` DNS records using the system DNS resolver, causing `querySrv ECONNREFUSED` errors even when `nslookup` works fine. The fix has two parts — first fix your system DNS, then use a direct connection URL.

---

## 🛠️ Fix First — Set Google DNS on Windows

Do this before anything else. Your system DNS is blocking SRV record lookups.

### 1️⃣ Open Network Adapter Settings

Press `Win + R`, type the following and press Enter:

```
ncpa.cpl
```

### 2️⃣ Open Your Active Network

You will see something like:
- Wi-Fi
- Ethernet

**Right click** your connected network → **Properties**

### 3️⃣ Open IPv4 Settings

Double click:

```
Internet Protocol Version 4 (TCP/IPv4)
```

Select:

```
Use the following DNS server addresses
```

Set:

```
Preferred DNS server:  8.8.8.8
Alternate DNS server:  8.8.4.4
```

Click **OK → OK**

### 4️⃣ Flush DNS Cache

Open **PowerShell** and run:

```powershell
ipconfig /flushdns
```

You should see:

```
Successfully flushed the DNS Resolver Cache
```

### 5️⃣ Restart Internet

Turn **Wi-Fi OFF → ON** or reconnect your Ethernet cable.

---

## Step 1 — Get the Shard Hostnames

Open **PowerShell** and run:

```powershell
nslookup -type=SRV _mongodb._tcp.cluster1.7ueqgip.mongodb.net 8.8.8.8
```

**Expected output:**

```
_mongodb._tcp.cluster1.7ueqgip.mongodb.net   SRV service location:
    port     = 27017
    svr hostname = ac-q7fvhk9-shard-00-00.7ueqgip.mongodb.net

_mongodb._tcp.cluster1.7ueqgip.mongodb.net   SRV service location:
    port     = 27017
    svr hostname = ac-q7fvhk9-shard-00-01.7ueqgip.mongodb.net

_mongodb._tcp.cluster1.7ueqgip.mongodb.net   SRV service location:
    port     = 27017
    svr hostname = ac-q7fvhk9-shard-00-02.7ueqgip.mongodb.net
```

Note down all 3 hostnames and the port (`27017`).

---

## Step 2 — Get the Replica Set Name

Run this in **PowerShell**:

```powershell
nslookup -type=TXT cluster1.7ueqgip.mongodb.net 8.8.8.8
```

**Expected output:**

```
cluster1.7ueqgip.mongodb.net   text = "authSource=admin&replicaSet=atlas-q7fvhk9-shard-0"
```

Note down the `replicaSet` value (e.g. `atlas-q7fvhk9-shard-0`).

---

## Step 3 — Build the Direct Connection URL

Use this format:

```
mongodb://USERNAME:PASSWORD@SHARD0:PORT,SHARD1:PORT,SHARD2:PORT/DBNAME?replicaSet=REPLICASET&authSource=admin&tls=true
```

For this project it becomes:

```
mongodb://learnova_db:learnova_db12341234@ac-q7fvhk9-shard-00-00.7ueqgip.mongodb.net:27017,ac-q7fvhk9-shard-00-01.7ueqgip.mongodb.net:27017,ac-q7fvhk9-shard-00-02.7ueqgip.mongodb.net:27017/learnova_collection?replicaSet=atlas-q7fvhk9-shard-0&authSource=admin&tls=true
```

---

## Step 4 — Update `.env`

```env
MONGO_URL=mongodb://learnova_db:learnova_db12341234@ac-q7fvhk9-shard-00-00.7ueqgip.mongodb.net:27017,ac-q7fvhk9-shard-00-01.7ueqgip.mongodb.net:27017,ac-q7fvhk9-shard-00-02.7ueqgip.mongodb.net:27017
MONGO_NAME=learnova_collection
```

---

## Step 5 — Update `connectdb.js`

```javascript
import mongoose from "mongoose";
import { setDefaultResultOrder } from "dns";

setDefaultResultOrder("ipv4first");

if (!(process.env.MONGO_URL && process.env.MONGO_NAME)) {
    throw new Error("MONGO_URL and MONGO_NAME must be defined");
}

const url = `${process.env.MONGO_URL}/${process.env.MONGO_NAME}`;

export const connectDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(url, {
            tls: true,
            authSource: "admin",
            replicaSet: "atlas-q7fvhk9-shard-0",  // ← value from Step 2
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        });
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Failed: ${error.message}`);
        throw new Error(`MongoDB Connection Failed: ${error.message}`);
    }
};
```

---

## Step 6 — Update `server.js`

Make sure `setDefaultResultOrder` is called **before all other imports**:

```javascript
// Must be first — before any other imports
import { setDefaultResultOrder } from "dns";
setDefaultResultOrder("ipv4first");

import "dotenv/config";
import { connectDb } from "./database/connectdb.js";
import App from "./app.js";
```

---

## Alternative — Get the URL from Atlas UI

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Database → Connect** on your cluster
3. Choose **Drivers** → Node.js
4. Copy the connection string shown
5. Replace `<password>` with your actual password

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `querySrv ECONNREFUSED` | System DNS can't resolve SRV records | Use direct URL (this guide) |
| `Server selection timed out` | Wrong `replicaSet` name | Run Step 2 to get exact name |
| `Could not connect — IP not whitelisted` | Atlas IP Access List | Add `0.0.0.0/0` in Atlas → Network Access |
| `Authentication failed` | Wrong username/password | Check Atlas → Database Access |

---

## Verify Port is Open

```powershell
Test-NetConnection -ComputerName ac-q7fvhk9-shard-00-00.7ueqgip.mongodb.net -Port 27017
```

`TcpTestSucceeded: True` means the port is reachable. If `False`, your ISP/firewall is blocking port 27017 — use a VPN or contact your network admin.