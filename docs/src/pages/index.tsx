import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx('hero__title', styles.header)}>
          {siteConfig.title}
        </Heading>
        <img
          className={clsx(styles.logo)}
          src="/img/logo.png"
          alt="Sheriff"
          title="Sheriff"
        />
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Modularity for TypeScript Projects"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>

      <div className={clsx(styles.getStarted, 'container')}>
        <Link
          className="button button--secondary button--lg"
          to="/docs/introduction"
        >
          Get started
        </Link>
      </div>
    </Layout>
  );
}
