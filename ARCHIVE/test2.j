NB. i|D:React:react|S::../../../stylesheets/application.css|N:FontAwesomeIcon:@fortawesome/react-fontawesome|N:faEnvelope:@fortawesome/free-solid-svg-icons|N:faFacebook,faTwitter,faInstagram,faYoutube:@fortawesome/free-brands-svg-icons

socialMediaIcons =: faFacebook ; faTwitter ; faInstagram ; faEnvelope ; faYoutube

Footer =: {{
'<footer className="w-full bg-green-500 text-white p-4 flex flex-col justify-center items-center">        <ul>            {' , (({{ NB. p|icon,id
'<li key={' , id , '} className="inline-block px-2 text-lg">                    <FontAwesomeIcon icon={' , icon , '} className="hover:text-gray-300" />                </li>'
}}) "0 socialMediaIcons) , '}        </ul>        <p className="text-sm pt-4">Copyright ©Livra</p>    </footer>'
}}

NB. e|Footer