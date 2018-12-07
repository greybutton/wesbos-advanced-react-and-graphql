import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';

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