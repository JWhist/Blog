export default (req, context) => {
  context.log(
    `Client IP header test: ${req.headers.get('x-nf-client-connection-ip')}`
  );
  context.log(`Context.ip prop: ${context.ip}`);
};
