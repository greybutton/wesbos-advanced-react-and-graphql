import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { MockedProvider } from 'react-apollo/test-utils';
import Router from 'next/router';

import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem';
import { fakeItem } from '../lib/testUtils';

const dogImage = 'https://dog.com/dog.jpg';

global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: dogImage,
    eager: [{ secure_url: dogImage }],
  }),
});

describe('<CreateItem />', () => {
  it('renders and matches snapshot', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it('uploads a file when chenged', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    const input = wrapper.find('input[type="file"]');
    input.simulate('change', { target: { files: ['fakedog.jpg'] } });
    await wait();
    const component = wrapper.find('CreateItem').instance();
    // wrapper.update();
    expect(component.state.image).toEqual(dogImage);
    expect(component.state.largeImage).toEqual(dogImage);
    expect(global.fetch).toHaveBeenCalled();
    global.fetch.mockReset();
  });

  it('handles state updating', async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find('#title')
      .simulate('change', { target: { value: 'Testing', name: 'title' } });
    wrapper
      .find('#price')
      .simulate('change', { target: { value: 50000, name: 'price', type: 'number' } });
    wrapper
      .find('#description')
      .simulate('change', { target: { value: 'Description', name: 'description' } });
    
    expect(wrapper.find('CreateItem').instance().state).toMatchObject({
      title: 'Testing',
      price: 50000,
      description: 'Description'
    });
  });

  it('creates an item when the form is submitted', async () => {
    const item = fakeItem();
    const mocks = [{
      request: {
        query: CREATE_ITEM_MUTATION,
        variables: {
          title: item.title,
          description: item.description,
          image: '',
          largeImage: '',
          price: item.price,
        },
      },
      result: {
        data: {
          createItem: {
            ...fakeItem,
            id: 'id123',
            __typename: 'Item',
          },
        },
      },
    }];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );
    wrapper
      .find('#title')
      .simulate('change', { target: { value: item.title, name: 'title' } });
    wrapper
      .find('#price')
      .simulate('change', { target: { value: item.price, name: 'price', type: 'number' } });
    wrapper
      .find('#description')
      .simulate('change', { target: { value: item.description, name: 'description' } });

    Router.router = { push: jest.fn() };
    wrapper.find('form').simulate('submit');
    await wait(50);
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({ pathname: '/item', query: { id: 'id123' } });
  });
});
