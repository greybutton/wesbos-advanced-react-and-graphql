import Link from 'next/link';
import { Mutation } from 'react-apollo';

import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';

import { TOGGLE_CART_MUTATION } from './Cart';
import { from } from 'zen-observable';

const Nav = () => {
  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles>
          <Link href="/items">Shop</Link>
          {me && (
            <>
              <Link href="/sell">Sell</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/account">Account</Link>
              <Signout />
              <Mutation
                mutation={TOGGLE_CART_MUTATION}
              >
                {toggleCart => (
                  <button
                    type="button"
                    onClick={toggleCart}
                  >
                    My cart
                  </button>
                )}
              </Mutation>
            </>
          )}
          {!me && (
            <Link href="/signup">Sign in</Link>
          )}
        </NavStyles>
      )}
    </User>
  );
};

export default Nav;