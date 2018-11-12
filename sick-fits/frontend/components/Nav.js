import Link from 'next/link';

const Nav = () => {
  return (
    <div>
      <Link href="/">Home page</Link>
      <Link href="/sell">Sell page</Link>
    </div>
  );
};

export default Nav;