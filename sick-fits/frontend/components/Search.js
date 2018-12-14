import React from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';

import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEACH_ITEMS_QUERY = gql`
  query SEACH_ITEMS_QUERY($searchTerm: String!) {
    items(where: {
      OR: [
        { title_contains: $searchTerm },
        { description_contains: $searchTerm },
      ]
    }) {
      id
      image
      title
    }
  }
`;

class AutoComplete extends React.Component {
  state = {
    items: [],
    loading: false,
  }

  onChange = debounce(async (e, client) => {
    this.setState({ loading: true });
    const res = await client.query(
      {
        query: SEACH_ITEMS_QUERY,
        variables: { searchTerm: e.target.value },
      }
    );
    this.setState({
      loading: false,
      items: res.data.items,
    });
  }, 350);

  render() {
    return (
      <SearchStyles>
        <div>
          <ApolloConsumer>
            {(client) => (
              <input 
                type="search"
                onChange={e => {
                  e.persist();
                  this.onChange(e, client);
                }}
              />
            )}
          </ApolloConsumer>
          <DropDown>
            {this.state.items.map(item => (
              <DropDownItem key={item.id}>
                <img width="50" src={item.image} alt={item.title} />
                {item.title}
              </DropDownItem>
            ))}
          </DropDown>
        </div>
      </SearchStyles>
    );
  }
}

export default AutoComplete;