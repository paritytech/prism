import 'jquery';
import React from 'react';
import {render} from 'react-dom';
import {App} from './app.jsx'
import {web3} from './web3plus.jsx';

render(<App prism="0x536c2622748118a82bc9fb15a450d828966d9761"/>, document.getElementById('app'));
