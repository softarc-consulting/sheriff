import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import { useColorMode } from '@docusaurus/theme-common';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  SvgDark: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Modular Codebase',
    Svg: require('@site/static/img/modularity.svg').default,
    SvgDark: require('@site/static/img/modularity-dark.svg').default,
    description: (
      <>
        Modularity as core software design principle let's you scale your codebase. Sheriff is there to make sure everyone is playing by the rules.
      </>
    ),
  },
  {
    title: 'Zero Dependencies',
    Svg: require('@site/static/img/zero-dependencies.svg').default,
    SvgDark: require('@site/static/img/zero-dependencies-dark.svg').default,
    description: (
      <>
        We understand the burden of every additional dependency. That's why Sheriff is just Sheriff.
      </>
    ),
  },
  {
    title: 'Simplicity',
    Svg: require('@site/static/img/simplicity.svg').default,
    SvgDark: require('@site/static/img/simplicity-dark.svg').default,
    description: (
      <>
        Sheriff keeps it at a minimum. No overblown configuration, just the absolute necessary.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  const { isDarkTheme } = useColorMode();
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => {
            const featureProps = { ...props, Svg: isDarkTheme ? props.SvgDark : props.Svg };
            return (
              <Feature key={idx} {...featureProps} />
            );
          })}
        </div>
      </div>
    </section>
  );
}
