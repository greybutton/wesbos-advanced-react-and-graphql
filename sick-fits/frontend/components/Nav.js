import Link from 'next/link';
import { Mutation } from 'react-apollo';

import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';

import { TOGGLE_CART_MUTATION } from './Cart';
import CartCount from './CartCount';

const Nav = () => {
  return (
    <User>
      {({ data: { me } }) => (
        <NavStyles data-test="nav">
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
                    <CartCount count={me.cart.reduce((acc, item) => acc + item.quantity, 0)} />
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