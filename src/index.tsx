import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { egowindowLock, egoWarningTriangle, egoBubbleChatTyping } from './img/index';
import './index.css';
import './styles/missingProvider.css';
import './styles/modalEnhancer.css';
import './styles/calendarEnhancer.css';
import './styles/reactToggle.css';

const { Web3Provider } = require('react-web3');

var unlockWalletHtml = (
  <div className='web3-needed'>
    <div className='content'>
      <div className='modal-header'>
        <h1 className='title'>Web3 account is locked</h1>
      </div>
      <div className='modal-content'>
        <div className='visual-tip'>
          <img className='tip' src={egowindowLock} />
          <img className='action' src={egoWarningTriangle} />
        </div>
        <p>
          This application requires at least one valid account to be
        unlocked within your desired provider. This is needed to interact with the
        blockchain as the person you claim to be and no one else.
        </p>
      </div>
      <div className='modal-actions'>
        <a target='_blank' className='button' href='https://medium.com/latude/metamask-introduction-f89ac80bd30f'>Info</a>
      </div>
    </div>
  </div>
);

var web3NeededHtml = (
  <div className='web3-needed'>
    <div className='content'>
      <div className='modal-header'>
        <h1 className='title'>Web3 provider not found</h1>
      </div>
      <div className='modal-content'>
        <div className='visual-tip'>
          <img className='tip' src={egoBubbleChatTyping} />
          <img className='action' src={egoWarningTriangle} />
        </div>
        <p>
          This is a decentralized web application which requires an ethereum provider. You can use
        <a target='_blank' className='provider-link' href='https://metamask.io/'>Metamask</a> chrome extension or the
        <a target='_blank' className='provider-link' href='https://github.com/ethereum/mist/releases'>Mist</a> browser to interact with this application.
        </p>
      </div>
      <div className='modal-actions'>
        <a target='_blank' className='button' href='https://medium.com/latude/metamask-introduction-f89ac80bd30f'>Info</a>
      </div>
    </div>
  </div>
);

ReactDOM.render(
  <Web3Provider accountUnavailableScreen={() => unlockWalletHtml} web3UnavailableScreen={() => web3NeededHtml}>
    <App />
  </Web3Provider>,
  document.getElementById('root') as HTMLElement
);