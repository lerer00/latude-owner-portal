import * as React from 'react';
import Property from '../property';
import Breadcrumbs from '../breadcrumbs'
import Spinner from '../spinner'
import './index.css';
import Ethereum from '../utilities/ethereum';

const Modal = require('react-modal');
const contract = require('truffle-contract');
const CompanyContract = require('../build/contracts/Company.json');
const companyContract = contract(CompanyContract);
const egoPenChecklist = require('../img/ego/pen-checklist.svg');
const egoAxe = require('../img/ego/axe.svg');
const egoCheckHexagon = require('../img/ego/check-hexagon.svg');
const egoCursorHand = require('../img/ego/cursor-hand.svg');

const addPropertyModalStyles = {
    content: {
        padding: '16px',
        width: '600px',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        overflow: 'none',
        borderRadius: '3px',
        borderColor: '#C0C0C0',
        boxShadow: '3px 3px 15px #7F7F7F',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.25)'
    }
};

export namespace CompanyDetail {
    export interface Props {
        match: any
    }

    export interface State {
        loading: boolean,
        web3: any;
        properties: Array<string>;
        addPropertyModalIsOpen: boolean;
        addProperty: any;
    }
}

class CompanyDetail extends React.Component<CompanyDetail.Props, CompanyDetail.State> {
    constructor(props?: CompanyDetail.Props, context?: any) {
        super(props, context);

        this.state = {
            loading: true,
            web3: undefined,
            properties: [],
            addPropertyModalIsOpen: false,
            addProperty: {
                name: 'latude québec (todo)'
            }
        };

        this.addProperty = this.addProperty.bind(this);
        this.addPropertyOnRequestClose = this.addPropertyOnRequestClose.bind(this);
        this.addPropertyOnRequestOpen = this.addPropertyOnRequestOpen.bind(this);
        this.addPropertyHandleChanges = this.addPropertyHandleChanges.bind(this);
    }

    componentWillMount() {
        var ethereum = new Ethereum();
        var web3 = ethereum.getWeb3();
        this.setState({
            web3: web3
        });
    }

    componentDidMount() {
        this.getProperties();
    }

    getProperties() {
        companyContract.setProvider(this.state.web3.currentProvider);
        var companyInstance;
        this.state.web3.eth.getAccounts((error: any, accounts: any) => {
            companyContract.at(this.props.match.params.cid).then((instance: any) => {
                companyInstance = instance;

                return companyInstance.getProperties.call();
            }).then((result: any) => {
                this.setState({
                    properties: result,
                    loading: false
                });
                this.forceUpdate();
            });
        });
    }

    addProperty(e: any) {
        e.preventDefault();

        if (this.state.addProperty.name === '')
            return;

        companyContract.setProvider(this.state.web3.currentProvider);
        var companyInstance;
        this.state.web3.eth.getAccounts((error: any, accounts: any) => {
            companyContract.at(this.props.match.params.cid).then((instance: any) => {
                companyInstance = instance;

                return companyInstance.addProperty(this.state.addProperty.name, { from: accounts[0] });
            }).then((result: any) => {
                this.setState({
                    addPropertyModalIsOpen: false,
                    addProperty: {
                        name: ''
                    }
                })
            });;
        });
    }

    addPropertyOnRequestClose() {
        this.setState({
            addPropertyModalIsOpen: false
        });
    }

    addPropertyOnRequestOpen() {
        this.setState({
            addPropertyModalIsOpen: true
        });
    }

    addPropertyHandleChanges(property: string, e: any) {
        var tmp = this.state.addProperty;
        tmp[property] = e.target.value;
        this.setState({
            addProperty: tmp
        });
    }

    render() {
        var propertiesContent;
        if (this.state.loading)
            propertiesContent = <Spinner text="loading company..." />
        else {
            if (this.state.properties.length > 0) {
                propertiesContent = this.state.properties.map((id) =>
                    <Property company={this.props.match.params.cid} web3={this.state.web3} key={id} id={id} />
                );
            } else {
                propertiesContent =
                    <div className="empty">
                        <img className="icon" src={egoCursorHand} />
                        <p className="text">No properties found...</p>
                    </div>;
            }
        }

        const routes: any = [
            {
                name: 'Companies',
                path: '/companies',
                active: true,
            },
            {
                name: this.props.match.params.cid,
                path: '/companies/' + this.props.match.params.cid,
                active: true,
            }
        ]

        return (
            <section className="company-detail">
                <div className="content">
                    <Breadcrumbs routes={routes} />
                    <button className="add-property" onClick={this.addPropertyOnRequestOpen}>
                        <img className="add-property-icon" src={egoPenChecklist} />
                        <span className="add-property-text">Add property</span>
                    </button>
                    <Modal
                        isOpen={this.state.addPropertyModalIsOpen}
                        onRequestClose={this.addPropertyOnRequestClose}
                        style={addPropertyModalStyles}
                        contentLabel="Modal">
                        <div className="modal-header">
                            <h1 className="title">Add property</h1>
                            <img className="close" src={egoAxe} onClick={this.addPropertyOnRequestClose} />
                        </div>
                        <div className="modal-content">
                            <img className="visual-tip" src={egoCheckHexagon} />
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                            <form className="addPropertyForm">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="label"><label>Name:</label></td>
                                            <td><input className="value" type="text" value={this.state.addProperty.name} onChange={(e) => this.addPropertyHandleChanges('name', e)} /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                        <div className="modal-actions">
                            <button className="action" onClick={(e) => this.addProperty(e)}>Add</button>
                            <button className="action close" onClick={this.addPropertyOnRequestClose}>Close</button>
                        </div>
                    </Modal>
                    {propertiesContent}
                </div>
            </section>
        );
    }
}

export default CompanyDetail;