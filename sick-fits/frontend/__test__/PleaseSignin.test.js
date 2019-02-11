import { mount } from 'enzyme';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';

import { fakeUser } from '../lib/testUtils';
import PleaseSignin from '../components/PleaseSignin';
import { CURRENT_USER_QUERY } from '../components/User';

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: null } },
  },
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { me: fakeUser() } },
  },
];

describe('<PleaseSignin />', () => {
  it('renders the sign in dialog to logged out users', async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignin />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain('Please sign in before continuing');
    expect(wrapper.find('Signin').exists()).toBeTruthy();
  });

  it('renders the child component when the user is signed in', async () => {
    const Hey = () => <p>Hey</p>;
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignin>
            <Hey />
        </PleaseSignin>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.contains(<Hey />)).toBeTruthy();
  });
});
