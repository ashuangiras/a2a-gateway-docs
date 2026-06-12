import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            href="https://github.com/ashuangiras/a2a-gateway">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  description: string;
};

const features: FeatureItem[] = [
  {
    title: 'Three backend types',
    description:
      'Route A2A tasks to an ACP executable, an OpenAI-compatible HTTP API, or a downstream A2A agent — one config file, no code changes.',
  },
  {
    title: 'Production-ready defaults',
    description:
      'Bearer token auth, TLS, per-caller rate limiting, SQLite task persistence, push notification webhooks, and Prometheus metrics out of the box.',
  },
  {
    title: 'Horizontally scalable',
    description:
      'Multiple replicas share SQLite WAL databases for task state, push configs, and permission pause state. Any replica can serve any request.',
  },
  {
    title: 'Zero CGO',
    description:
      'Pure Go build with no CGO dependency. Cross-compiles to any GOOS/GOARCH target with a single go build command.',
  },
  {
    title: 'A2A SDK-powered',
    description:
      'Built on the official a2a-go/v2 SDK. Handles all JSON-RPC dispatch, SSE streaming, agent card serving, and push notification plumbing.',
  },
  {
    title: 'Observable',
    description:
      'Prometheus metrics (a2a_tasks_total, a2a_task_duration_seconds, and more), OpenTelemetry OTLP tracing, and structured JSON logging via zap.',
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{paddingTop: '1.5rem', paddingBottom: '1.5rem'}}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="A2A protocol gateway for ACP executables, OpenAI-compatible APIs, and downstream A2A agents">
      <HomepageHeader />
      <main>
        <section style={{padding: '2rem 0'}}>
          <div className="container">
            <div className="row">
              {features.map((item) => (
                <Feature key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>
        <section style={{background: 'var(--ifm-color-emphasis-100)', padding: '2rem 0'}}>
          <div className="container">
            <Heading as="h2">Quick start</Heading>
            <pre style={{background: 'var(--ifm-code-background)', padding: '1rem', borderRadius: '4px'}}>
              <code>{`git clone https://github.com/ashuangiras/a2a-gateway
cd a2a-gateway
make build
./bin/a2a-gateway serve --config agents/example-http.yaml`}</code>
            </pre>
            <p>
              See the <Link to="/docs/getting-started">Getting Started</Link> guide for a step-by-step walkthrough.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
