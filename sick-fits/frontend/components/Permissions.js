import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import Error from './ErrorMessage';
import Table from './styles/Table';
import SickButton from './styles/SickButton';

const possiblePermissions = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`;

const Permissions = (props) => (
  <Query query={ALL_USERS_QUERY}>
    {({ loading, error, data }) => (
      <div>
        <Error error={error} />
        <div>
          <h2>Manage permissions</h2>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                {possiblePermissions.map((p, i) => <th key={i}>{p}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(user => <UserPermissions key={user.id} user={user} />)}
            </tbody>
          </Table>
        </div>
      </div>
    )}
  </Query>
);

class UserPermissions extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      id: PropTypes.string,
      permissions: PropTypes.array,
    }).isRequired
  }

  state = {
    permissions: this.props.user.permissions, 
  }

  handlePermissionChange = (e) => {
    const { target: { value, checked } } = e;
    let updatedPermissions = [...this.state.permissions];
    if (checked) {
      updatedPermissions.push(value);
    } else {
      updatedPermissions = updatedPermissions.filter(p => p !== value);
    }
    this.setState({ permissions: updatedPermissions });
  }

  render() {
    const { user } = this.props;
    return (
      <Mutation
        mutation={UPDATE_PERMISSIONS_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: this.props.user.id,
        }}
      >
        {(updatePermissions, { loading, error }) => (
          <>
          {error && <tr><Error error={error} /></tr>}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermissions.map((p, i) => (
                <td key={i}>
                  <label htmlFor={`${user.id}-permission-${p}`}>
                    <input 
                      id={`${user.id}-permission-${p}`}
                      type="checkbox" 
                      checked={this.state.permissions.includes(p)}
                      value={p}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? 'ing' : 'e'}
                </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }
}

export default Permissions;