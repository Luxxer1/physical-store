export default () => {
  const databaseUri = process.env.DATABASE_URI;
  const databasePassword = process.env.DATABASE_PASSWORD;

  if (!databaseUri || !databasePassword) {
    throw new Error(
      'DATABASE_URI and DATABASE_PASSWORD must be defined in the .env file',
    );
  }

  const updatedDatabaseUri = databaseUri.replace(
    '<db_password>',
    databasePassword,
  );

  return {
    database: {
      uri: updatedDatabaseUri,
    },
  };
};
