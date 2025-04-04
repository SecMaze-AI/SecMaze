import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>SecMaze - Intelligent Network Defense Maze</title>
        <meta name="description" content="SecMaze is an innovative network security solution that identifies and blocks malicious crawlers and automated attacks." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <Link href="/">
            SecMaze
          </Link>
        </div>
        <div className={styles.navLinks}>
          <Link href="/maze" className={styles.navLink}>
            Try Challenge
          </Link>
          <Link href="/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/docs" className={styles.navLink}>
            Documentation
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </div>
        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
          <Link href="/register" className={styles.registerButton}>
            Register
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Image
              src="/logo.png"
              alt="SecMaze Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className={styles.title}>
            SecMaze
          </h1>
          <p className={styles.description}>
            Intelligent Network Defense Maze
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Adaptive Challenge Engine</h2>
            <p>Adjusts maze complexity in real-time based on visitor behavior patterns</p>
          </div>

          <div className={styles.card}>
            <h2>Multi-level Verification</h2>
            <p>Combines multiple verification mechanisms to identify and block malicious bots</p>
          </div>

          <div className={styles.card}>
            <h2>Machine Learning Engine</h2>
            <p>Weekly updated crawler signature database with automated detection improvements</p>
          </div>

          <div className={styles.card}>
            <h2>Blockchain-Enhanced Security</h2>
            <p>Decentralized threat intelligence sharing through blockchain technology</p>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <Link href="/maze" className={styles.button}>
            Try Maze Challenge
          </Link>
          <Link href="/docs" className={styles.buttonOutline}>
            Documentation
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Powered by{' '}
          <span className={styles.logo}>
            SecMaze
          </span>
        </p>
        <div className={styles.footerLinks}>
          <Link href="https://x.com/secmaze_">
            Twitter
          </Link>
          <Link href="https://github.com/SecMaze-AI">
            GitHub
          </Link>
          <Link href="/privacy">
            Privacy Policy
          </Link>
          <Link href="/terms">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
} 