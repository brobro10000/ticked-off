const { User, Task } = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    task: async (parent,args) => {
         return Task.find()
    },
    user: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findById(context.user._id)
          .select("-__v -password")
        return userData;
      }
      throw new AuthenticationError("Not logged in");
    },
  },
  Mutation: {
    deleteTask: async (parent,args) => {
      console.log(args)
      return Task.deleteOne(
        {_id: args.id}
      )},

    createTask: async (parent, args) => {
      return Task.create(args)
    },
    createUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      const token = signToken(user);
      return { token, user };
    },
  },
};

module.exports = resolvers;
