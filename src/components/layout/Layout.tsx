import React from 'react';

import './layout.scss';
import Navbar from './navbar/Navbar';
import Footer from './footer/Footer';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="page-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
