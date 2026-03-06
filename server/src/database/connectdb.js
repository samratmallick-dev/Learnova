import mongoose from "mongoose";

if (!(process.env.MONGO_URL && process.env.MONGO_NAME)) {
      console.error("MONGO_URL and MONGO_NAME must be defined");
      throw new Error("MONGO_URL and MONGO_NAME must be defined");
}

const url = `${process.env.MONGO_URL}/${process.env.MONGO_NAME}?authSource=admin`;
console.log("Connecting to:", url);

export const connectDb = async () => {
      try {
            const connectionInstance = await mongoose.connect(url, {
                  tls: true,
                  directConnection: false,
                  serverSelectionTimeoutMS: 30000,
                  socketTimeoutMS: 45000,
                  connectTimeoutMS: 30000,
                  heartbeatFrequencyMS: 10000,
            });
            console.log(`MongoDB connected successfully to host: ${connectionInstance.connection.host}`);
      } catch (error) {
            console.error(`MongoDB Connection Failed: ${error.message}`);
            throw new Error(`MongoDB Connection Failed: ${error.message}`);
      }
};



// Another process - {mongodb+srv://<db_username>:<db_password>@cluster1.7ueqgip.mongodb.net/} this url
// import mongoose from "mongoose";
// import { Resolver } from "dns/promises";
// import { setDefaultResultOrder } from "dns";

// // Force Node.js to use Google DNS for SRV resolution
// setDefaultResultOrder("ipv4first");

// if (!(process.env.MONGO_URL && process.env.MONGO_NAME)) {
//       console.error("MONGO_URL and MONGO_NAME must be defined");
//       throw new Error("MONGO_URL and MONGO_NAME must be defined");
// }

// // Parse credentials from mongodb+srv URL
// const parseCredentials = (srvUrl) => {
//       const match = srvUrl.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
//       if (!match) throw new Error("Invalid MONGO_URL format");
//       return { user: match[1], pass: match[2] };
// };

// // Extract cluster hostname from mongodb+srv URL
// const parseHost = (srvUrl) => {
//       const match = srvUrl.match(/@([^/]+)/);
//       if (!match) throw new Error("Invalid MONGO_URL: cannot parse host");
//       return match[1]; // e.g. cluster1.7ueqgip.mongodb.net
// };

// export const connectDb = async () => {
//       try {
//             const { user, pass } = parseCredentials(process.env.MONGO_URL);
//             const clusterHost = parseHost(process.env.MONGO_URL);

//             // Use Google DNS to resolve SRV + TXT records
//             const resolver = new Resolver();
//             resolver.setServers(["8.8.8.8", "8.8.4.4"]);

//             console.log(`Resolving SRV for _mongodb._tcp.${clusterHost} via Google DNS...`);
//             const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${clusterHost}`);
//             const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(",");
//             console.log("Resolved hosts:", hosts);

//             // Get replicaSet + authSource from TXT record
//             let replicaSet = null;
//             let authSource = "admin";
//             try {
//                   const txtRecords = await resolver.resolveTxt(clusterHost);
//                   const flat = txtRecords.flat().join("");
//                   console.log("TXT Record:", flat);
//                   const rsMatch = flat.match(/replicaSet=([^&]+)/);
//                   const asMatch = flat.match(/authSource=([^&]+)/);
//                   if (rsMatch) replicaSet = rsMatch[1];
//                   if (asMatch) authSource = asMatch[1];
//             } catch {
//                   console.log("TXT lookup failed, using authSource=admin");
//             }

//             const directUrl = `mongodb://${user}:${encodeURIComponent(pass)}@${hosts}/${process.env.MONGO_NAME}`;

//             const options = {
//                   tls: true,
//                   authSource,
//                   serverSelectionTimeoutMS: 30000,
//                   socketTimeoutMS: 45000,
//                   connectTimeoutMS: 30000,
//             };

//             if (replicaSet) {
//                   options.replicaSet = replicaSet;
//                   console.log("Using replicaSet:", replicaSet);
//             }

//             console.log("Connecting with options:", { ...options, hosts });
//             const connectionInstance = await mongoose.connect(directUrl, options);
//             console.log(`MongoDB connected successfully to host: ${connectionInstance.connection.host}`);

//       } catch (error) {
//             console.error(`MongoDB Connection Failed: ${error.message}`);
//             throw new Error(`MongoDB Connection Failed: ${error.message}`);
//       }
// };