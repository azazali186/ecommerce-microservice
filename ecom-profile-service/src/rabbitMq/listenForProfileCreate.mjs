import Profile from "../models/profile.mjs";
import { connect } from "amqplib";

const getProfile = async (userData) => {
  try {
    let userProfile = await Profile.findOne({ userId: userData.userId });
    
    if (userProfile) {
      if (userData.name) userProfile.name = userData.name;

      if (userData.dob) userProfile.dob = userData.dob;

      if (userData.isActive) userProfile.isActive = userData.isActive;

      if (userData.isVerify) userProfile.isVerify = userData.isVerify;

      await userProfile.save();
    } else {
      userProfile = new Profile();
      if (userData.name) userProfile.name = userData.name;

      if (userData.dob) userProfile.dob = userData.dob;

      userProfile.userId = userData.userId;

      await userProfile.save();
    }
    console.log("User profile ", userData);
    return userProfile;
  } catch (error) {
    console.error("Error fetching/updating user profile:", error);
    throw error; // or handle the error as needed
  }
};

export const listenForProfileRequest = async () => {
  const connection = await connect(
    process.env.RABBIT_MQ_URL || "amqp://localhost"
  );
  const channel = await connection.createChannel();

  await channel.assertQueue("ecommerce_create_user_profile");

  channel.consume("ecommerce_create_user_profile", async (msg) => {
    const userData = JSON.parse(msg.content.toString());

    const userProfile = await getProfile(userData);

    channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(
        JSON.stringify({
          userId: userData.userId,
          userProfile: userProfile,
        })
      ),
      {
        correlationId: msg.properties.correlationId,
      }
    );

    channel.ack(msg);
  });
};
