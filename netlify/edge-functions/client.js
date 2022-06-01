export default (req, context) =>
  context.log(req.headers.get('x-nf-client-connection-ip'));
