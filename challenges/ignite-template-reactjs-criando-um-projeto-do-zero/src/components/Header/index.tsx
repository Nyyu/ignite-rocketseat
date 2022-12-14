import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <Link href="/">
      <a>
        <img src="/images/Logo.svg" alt="logo" className={styles.icon} />
      </a>
    </Link>
  );
}
