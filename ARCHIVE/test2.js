import React from 'react';

import '../../../stylesheets/application.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

import { faFacebook, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const socialMediaIcons = [
  faFacebook,
  faTwitter,
  faInstagram,
  faEnvelope,
  faYoutube
];

const Footer = () => (
  <footer className="w-full bg-green-500 text-white p-4 flex flex-col justify-center items-center">        <ul>            {({{ NB. p|icon,id
'<li key={' , id , '} className="inline-block px-2 text-lg">                    <FontAwesomeIcon icon={' , icon , '} className="hover:text-gray-300" />                </li>'
}}) "0 socialMediaIcons}        </ul>        <p className="text-sm pt-4">Copyright ©Livra</p>    </footer>
);

export default Footer;