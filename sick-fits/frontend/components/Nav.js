import Link from 'next/link';
import NavStyles from './styles/NavStyles';

const Nav = () => {
  return (
    <NavStyles>
      <Link href="/items">Shop</Link>
      <Link href="/sell">Sell</Link>
      <Link href="/signup">Signup</Link>
      <Link href="/orders">Orders</Link>
      <Link href="/account">Account</Link>
    </NavStyles>
  );
};

export default Nav;