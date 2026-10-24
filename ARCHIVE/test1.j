require 'react'

NB. import '../../../stylesheets/application.css'

require '@fortawesome/react-fontawesome'

require '@fortawesome/free-solid-svg-icons'

require '@fortawesome/free-brands-svg-icons'

socialMediaIcons =: faFacebook ; faTwitter ; faInstagram ; faEnvelope ; faYoutube

Footer =: 3 : 0
'<footer class="w-full bg-green-500 text-white p-4 flex flex-col justify-center items-center">' ,   '<ul>' ,   (3 : 0
'<li key="', (id), '" class="inline-block px-2 text-lg">' ,   '<FontAwesomeIcon icon="', (icon), '" class="hover:text-gray-300">' , '</li>'
)) "0 socialMediaIcons , '</ul>'   '<p class="text-sm pt-4">' ,   'Copyright ©Livra' , '</p>' , '</footer>'
)

NB. export default Footer