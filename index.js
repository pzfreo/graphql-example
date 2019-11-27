const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const { MongoClient } = require('mongodb');

const context = () => MongoClient.connect('mongodb://localhost:27017/test', { useNewUrlParser: true })
  .then(client => client.db('test'));

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    bios: [Bio]
    bio(id: Int): Bio
  }
  type Mutation {
    addBio(input: BioInput) : Bio
  }
  input BioInput {
    name: NameInput
    title: String
    birth: String
    death: String
  }
  input NameInput {
    first: String
    last: String
  }
  type Bio {
    name: Name,
    title: String,
    birth: String,
    death: String,
    awards: [Award]
  }
  type Name {
    first: String,
    last: String
  },
  type Award {
    award: String,
    year: Float,
    by: String
  }
`);

// Provide resolver functions for your schema fields
const resolvers = {
  bios: (args, context) =>context().then(db => db.collection('bios').find().toArray()),
  bio: (args, context) =>context().then(db => db.collection('bios').findOne({ _id: args.id })),
  addBio: (args, context) => context().then(db => db.collection('bios').insertOne({ name: args.input.name, title: args.input.title, death: args.input.death, birth: args.input.birth})).then(response => response.ops[0])
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: resolvers,
  context,
  graphiql: true
}));
app.listen(4000);

console.log(`🚀 Server ready at http://localhost:4000/graphql`);