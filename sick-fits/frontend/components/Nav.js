import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import User from './User';

const Nav = () => {
  return (
    <NavStyles>
      <User>
        {({ data: { me } }) => {
          if (me) return <p>{me.name}</p>
          return null;
        }}
      </User>
      <Link href="/items">Shop</Link>
      <Link href="/sell">Sell</Link>
      <Link href="/signup">Signup</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/account">Account</Link>
    </NavStyles>
  );
};

export default Nav;