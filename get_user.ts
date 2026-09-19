import { connectDB } from "./src/lib/mongodb";
import User from "./src/models/User";

async function run() {
  await connectDB();
  const users = await User.find().lean();
  console.log("Users:", users.map(u => ({ id: u._id, email: u.email })));
  process.exit(0);
}
run();
