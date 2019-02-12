import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer } from 'react-apollo';

import RemoveFromCart, { REMOVE_FROM_CART_MUTATION } from '../components/RemoveFromCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: {
      ...fakeUser(),
      cart: [fakeCartItem({ id: 'id123' })],
    }}}
  },
  {
    request: { query: REMOVE_FROM_CART_MUTATION, variables: { id: 'id123' } },
    result: { data: {
      removeFromCart: {
        __typename: 'CartItem',
        id: 'id123',
      }
    }}
  }
];

describe('<RemoveFromCart />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RemoveFromCart id="id123" />
      </MockedProvider>
    );
    const form = wrapper.find('button');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it('removes the item from cart', async () => {
    let apolloClient;
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <ApolloConsumer>
          {client => {
            apolloClient = client;
            return <RemoveFromCart id="id123" />;
          }}
        </ApolloConsumer>
      </MockedProvider>
    );
    const res = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(res.data.me.cart).toHaveLength(1);
    expect(res.data.me.cart[0].item.price).toBe(5000);
    wrapper.find('button').simulate('click');
    await wait();
    const res2 = await apolloClient.query({ query: CURRENT_USER_QUERY });
    expect(res2.data.me.cart).toHaveLength(0);
  });
});