import Link from 'next/link'

import User from './User'
import Signout from './Signout'
import NavStyles from './styles/NavStyles'

const Nav = () => (
  <User>
    {({ data: { currentUser } }) => (
      <NavStyles>
        <Link href="/items">
          <a>Shop</a>
        </Link>
        {currentUser && (
          <>
            <Link href="/sell">
              <a>Sell</a>
            </Link>

            <Link href="/orders">
              <a>Orders</a>
            </Link>
            <Link href="/account">
              <a>Account</a>
            </Link>
            <Signout />
          </>
        )}

        {!currentUser && (
          <Link href="/login">
            <a>Log In</a>
          </Link>
        )}
      </NavStyles>
    )}
  </User>
)

export default Nav
