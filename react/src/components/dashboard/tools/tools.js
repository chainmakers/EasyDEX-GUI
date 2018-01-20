import React from 'react';
import { translate } from '../../../translate/translate';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import {
  triggerToaster,
  shepherdToolsBalance,
  shepherdToolsBuildUnsigned,
  shepherdToolsPushTx,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import QRCode from 'qrcode.react';
import QRModal from '../qrModal/qrModal';

class Tools extends React.Component {
  constructor() {
    super();
    this.state = {
      sendFrom: '',
      sendTo: '',
      amount: 0,
      selectedCoin: '',
      balance: null,
      tx2qr: null,
      utxo: null,
      rawTx2Push: null,
      txPushResult: null,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.getBalance = this.getBalance.bind(this);
    this.getUnsignedTx = this.getUnsignedTx.bind(this);
    this.setRecieverFromScan = this.setRecieverFromScan.bind(this);
    this.closeQr = this.closeQr.bind(this);
  }

  sendTx() {
    let _txData = this.state.rawTx2Push.split(':');

    console.warn(_txData);

    shepherdToolsPushTx(_txData[0], _txData[1])
    .then((res) => {
      this.setState({
        txPushResult: res.result,
      });
    });
  }

  getBalance() {
    const _coin = this.state.selectedCoin.split('|');

    shepherdToolsBalance(_coin[0], this.state.sendFrom)
    .then((res) => {
      if (res.msg === 'success') {
        this.setState({
          balance: res.result,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            'Offline tx signing',
            'error'
          )
        );
      }
    });
  }

  getUnsignedTx() {
    const _coin = this.state.selectedCoin.split('|');

    shepherdToolsBuildUnsigned(_coin[0], this.state.amount * 100000000, this.state.sendTo, this.state.sendFrom)
    .then((res) => {
      console.warn(res);

      if (res.msg === 'success') {
        let tx2qr = 'agtx:';
        res = res.result;

        tx2qr += (res.network === 'komodo' ? 'KMD' : res.network) + ':' + res.outputAddress + ':' + res.changeAddress + ':' + res.value + ':' + res.change + ':u:';

        for (let i = 0; i < res.utxoSet.length; i++) {
          tx2qr += res.utxoSet[i].txid + ':' + res.utxoSet[i].value + ':' + res.utxoSet[i].vout + (i === res.utxoSet.length -1 ? '' : '-');
        }

        console.warn(tx2qr);
        console.warn('txqr length', tx2qr.length);

        // max 350 chars

        this.setState({
          tx2qr,
          utxo: res.utxoSet,
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            'Offline tx signing',
            'error'
          )
        );
      }
    });
  }

  setRecieverFromScan(receiver) {
    this.setState({
      rawTx2Push: receiver,
    });
  }

  closeQr() {
    this.setState({
      tx2qr: null,
    });
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
        <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  updateSelectedCoin(e, index) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      this.setState({
        selectedCoin: e.value,
        balance: null,
      });
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content tools background--white">
          <div className="row">
            <div className="col-sm-12 no-padding-left">
              <h2>Tools</h2>
              <h4 className="margin-top-20">Offline Transaction Signing</h4>
              <div className="col-xlg-12 form-group form-material no-padding-left margin-top-30 margin-bottom-70">
                <label
                  className="control-label col-sm-1 no-padding-left"
                  htmlFor="kmdWalletSendTo">Coin</label>
                <Select
                  name="selectedCoin"
                  className="col-sm-3"
                  value={ this.state.selectedCoin }
                  onChange={ (event) => this.updateSelectedCoin(event) }
                  optionRenderer={ this.renderCoinOption }
                  valueRenderer={ this.renderCoinOption }
                  options={ addCoinOptionsCrypto().concat(addCoinOptionsAC()) } />
              </div>
              <div className="col-sm-12 form-group form-material no-padding-left">
                <label
                  className="control-label col-sm-1 no-padding-left"
                  htmlFor="kmdWalletSendTo">{ translate('INDEX.SEND_FROM') }</label>
                <input
                  type="text"
                  className="form-control col-sm-3"
                  name="sendFrom"
                  onChange={ this.updateInput }
                  value={ this.state.sendFrom }
                  id="kmdWalletSendTo"
                  placeholder={ translate('SEND.ENTER_ADDRESS') }
                  autoComplete="off"
                  required />
              </div>
              <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
                <button
                  type="button"
                  className="btn btn-info col-xs-1"
                  onClick={ this.getBalance }>
                    Get balance
                </button>
                { this.state.balance &&
                  <label className="margin-left-20">Balance: { this.state.balance.balance } </label>
                }
              </div>
              <div className="col-sm-12 form-group form-material no-padding-left">
                <label
                  className="control-label col-sm-1 no-padding-left"
                  htmlFor="kmdWalletSendTo">{ translate('INDEX.SEND_TO') }</label>
                <input
                  type="text"
                  className="form-control col-sm-3"
                  name="sendTo"
                  onChange={ this.updateInput }
                  value={ this.state.sendTo }
                  id="kmdWalletSendTo"
                  placeholder={ translate('SEND.ENTER_ADDRESS') }
                  autoComplete="off"
                  required />
              </div>
              <div className="col-sm-12 form-group form-material no-padding-left">
                <label
                  className="control-label col-sm-1 no-padding-left"
                  htmlFor="kmdWalletAmount">
                  { translate('INDEX.AMOUNT') }
                </label>
                <input
                  type="text"
                  className="form-control col-sm-3"
                  name="amount"
                  value={ this.state.amount }
                  onChange={ this.updateInput }
                  id="kmdWalletAmount"
                  placeholder="0.000"
                  autoComplete="off" />
              </div>
              <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
                <button
                  type="button"
                  className="btn btn-primary col-sm-2"
                  onClick={ this.getUnsignedTx }>
                    Generate unsigned tx QR
                </button>
              </div>
              { this.state.tx2qr &&
                <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
                  <label className="control-label col-sm-1 no-padding-left">QR payload</label>
                  <textarea rows="5" cols="20" className="col-sm-7">{ this.state.tx2qr }</textarea>
                </div>
              }
              { this.state.tx2qr &&
                <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
                  <label className="control-label col-sm-2 no-padding-left">
                    UTXO count: { this.state.utxo.length }
                    { this.state.utxo.length > 3 &&
                      <span className="col-red margin-left-20">cant encode a qr tx larger than 3 utxos!</span>
                    }
                  </label>
                </div>
              }
            </div>
          </div>
          { this.state.tx2qr &&
            <div className="offlinesig-qr">
              <div className="margin-top-70 margin-bottom-70 center">
                <div style={{ border: 'solid 2px red', display: 'inline-block', padding: '50px' }}>
                  <QRCode
                    value={ this.state.tx2qr }
                    size={ 640 } />
                </div>
                <button
                  type="button"
                  className="btn btn-primary col-sm-2"
                  onClick={ this.closeQr }>
                    Make another tx
                </button>
              </div>
            </div>
          }
          <div className="row">
            <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
              <hr />
              <h4 className="margin-top-20 no-padding-left">Push QR transaction</h4>
            </div>
            <div className="col-sm-12 form-group form-material no-padding-left">
              <QRModal
                mode="scan"
                setRecieverFromScan={ this.setRecieverFromScan } />
            </div>
            { this.state.rawTx2Push &&
              <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
                <textarea rows="5" cols="20" className="col-sm-7 no-padding-left">{ this.state.rawTx2Push }</textarea>
              </div>
            }
            { this.state.txPushResult &&
              <div className="col-sm-12 form-group form-material no-padding-left margin-top-20">
                { this.state.txPushResult }
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default Tools;