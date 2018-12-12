import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { endpoint } from '../config';

import { LOCAL_STATE_QUERY } from '../components/Cart';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    clientState: {
      resolvers: {
        Mutation: {
          toggleCart: (_, args, { cache }) => {
            const { cartOpen } = cache.readQuery({ query: LOCAL_STATE_QUERY });
            const data = {
              data: { cartOpen: !cartOpen },
            };
            cache.writeData(data);
            return null;
          }
        }
      },
      defaults: {
        cartOpen: true,
      }
    }
  });
}

export default withApollo(createClient);
