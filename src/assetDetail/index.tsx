import * as React from 'react';
import * as PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import Breadcrumbs from '../breadcrumbs'
import Spinner from '../spinner';
import './index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const web3 = window['web3'];
const Modal = require('react-modal');
const ipfsAPI = require('ipfs-api')
const bl = require('bl');
const moment = require('moment');
const DateRange = require('react-date-range').DateRange;
const contract = require('truffle-contract');
const PropertyContract = require('../build/contracts/Property.json');
const propertyContract = contract(PropertyContract);
const egoAxe = require('../img/ego/axe.svg');
const egoCheckHexagon = require('../img/ego/check-hexagon.svg');
const egoPenChecklist = require('../img/ego/pen-checklist.svg');
const egoCursorHand = require('../img/ego/cursor-hand.svg');

const manageAssetModalStyles = {
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

export interface CalendarEvent {
    title: string;
    allDay: boolean;
    start: Date;
    end: Date;
    desc: string;
}

export namespace AssetDetail {
    export interface Props {
        match: any;
    }

    export interface State {
        loading: boolean,
        dataFound: boolean,
        ipfs: any,
        addStayModalIsOpen: boolean,
        manageAssetModalIsOpen: boolean,
        asset: any,
        dateRange: any
    }
}

class AssetDetail extends React.Component<AssetDetail.Props, AssetDetail.State> {
    constructor(props?: AssetDetail.Props, context?: any) {
        super(props, context);

        // initializing the calendar
        BigCalendar.momentLocalizer(moment)

        this.state = {
            loading: true,
            dataFound: false,
            ipfs: ipfsAPI('localhost', '5001', { protocol: 'http' }),
            addStayModalIsOpen: false,
            manageAssetModalIsOpen: false,
            asset: {
                name: '',
                description: '',
                type: '',
                price: -1,
                currency: 'XXX',
                events: []
            },
            dateRange: {
                startDate: null,
                endDate: null
            }
        }

        this.upsertAsset = this.upsertAsset.bind(this);
        this.manageAssetOnRequestClose = this.manageAssetOnRequestClose.bind(this);
        this.manageAssetOnRequestOpen = this.manageAssetOnRequestOpen.bind(this);
        this.manageAssetHandleChanges = this.manageAssetHandleChanges.bind(this);
        this.addStayOnRequestOpen = this.addStayOnRequestOpen.bind(this);
        this.addStayOnRequestClose = this.addStayOnRequestClose.bind(this);
        this.handleDateRangeSelect = this.handleDateRangeSelect.bind(this);
        this.addStay = this.addStay.bind(this);
    }

    static contextTypes = {
        web3: PropTypes.object
    }

    componentDidMount() {
        propertyContract.setProvider(web3.currentProvider);
        this.getAsset();
        this.getStays();
        this.retrieveLastAssetHash();
    }

    getAsset() {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            return instance.getAsset.call(this.props.match.params.aid);
        }).then((result: any) => {
            var tmpAsset = {
                name: result[1],
                description: '',
                type: '',
                price: result[2].toNumber(),
                currency: result[3],
                events: []
            };
            this.setState({
                asset: tmpAsset
            });
        });
    }

    // this returns all stays id
    getStays() {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            return instance.getStays.call(this.props.match.params.aid);
        }).then((result: Array<number>) => {
            result.forEach(id => {
                this.getStay(id);
            });
        });
    }

    // this fetch more information about each stay
    getStay(id: number) {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            return instance.getStay.call(this.props.match.params.aid, id);
        }).then((stay: any) => {
            console.log(stay);
            var event = this.convertStayToEvent(stay);
            var tmpAsset = this.state.asset;
            tmpAsset.events.push(event);
            this.setState({
                asset: tmpAsset
            }, () => {
                this.forceUpdate();
            });
        });
    }

    convertStayToEvent(stay: Array<any>): CalendarEvent {
        var startDate: any = new Date(stay[1].toNumber());
        var endDate: any = new Date(stay[2].toNumber());

        var event: CalendarEvent = {
            title: 'Booking',
            desc: '',
            allDay: true,
            start: startDate,
            end: endDate
        };

        return event;
    }

    // add a stay to a specific asset
    addStay(e: any) {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            var start = this.state.dateRange.startDate.format('x');
            var end = this.state.dateRange.endDate.format('x');
            return instance.addStay(this.props.match.params.aid, start, end, { from: this.context.web3.selectedAccount, value: 1000000000000000000 });
        }).then((result: any) => {
            this.addStayOnRequestClose();
        });
    }

    addAssetHash(hash: string) {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            return instance.addMetadataHashForAsset(this.props.match.params.aid, hash, { from: this.context.web3.selectedAccount });
        }).then((hash: string) => {
            this.manageAssetOnRequestClose();
        });
    }

    retrieveLastAssetHash() {
        propertyContract.at(this.props.match.params.pid).then((instance: any) => {
            return instance.lastMetadataHashForAsset.call(this.props.match.params.aid);
        }).then((hash: string) => {
            this.setState({
                loading: false,
                dataFound: true
            })
            this.getFile(hash);
        }).catch((error: any) => {
            this.setState({
                loading: false,
                dataFound: false
            })
        });
    }

    getFile(hash: string) {
        this.state.ipfs.files.cat(hash, (err: any, stream: any) => {
            if (err) {
                throw err;
            }
            stream.pipe(bl((e: any, d: any) => {
                if (e) {
                    throw err;
                }

                var ipfsAsset = JSON.parse(d.toString());

                var tmpAsset = this.state.asset;
                tmpAsset.description = ipfsAsset.description;
                tmpAsset.type = ipfsAsset.type;
                this.setState({
                    asset: tmpAsset
                });
            }));
        });
    }

    upsertAsset(e: any) {
        e.preventDefault();

        var filteredAsset = {
            description: this.state.asset.description,
            type: this.state.asset.type
        }

        const files = [
            {
                path: this.props.match.url + '.json',
                content: JSON.stringify(filteredAsset)
            }
        ]
        this.state.ipfs.files.add(files, null, (err: any, result: any) => {
            if (err)
                throw err;

            this.addAssetHash(result[0].hash);
        })
    }

    addStayOnRequestOpen() {
        this.setState({
            addStayModalIsOpen: true
        });
    }

    addStayOnRequestClose() {
        this.setState({
            addStayModalIsOpen: false
        })
    }

    manageAssetOnRequestClose() {
        this.setState({
            manageAssetModalIsOpen: false
        });
    }

    manageAssetOnRequestOpen() {
        this.setState({
            manageAssetModalIsOpen: true
        });
    }

    manageAssetHandleChanges(property: string, e: any) {
        var tmp = this.state.asset;
        tmp[property] = e.target.value;
        this.setState({
            asset: tmp
        });
    }

    handleDateRangeSelect(range: any) {
        this.setState({
            dateRange: range
        })
    }

    render() {
        var assetContent;
        if (this.state.loading)
            assetContent = <Spinner text="loading asset..." />
        else {
            if (this.state.dataFound) {
                assetContent = <div className="informations">
                    <p className="asset-name">{this.state.asset.name}</p>
                    <p className="asset-description">Description: {this.state.asset.description}</p>
                    <p className="asset-price">Price: {this.state.asset.price} {this.state.asset.currency}</p>
                    <p className="asset-type">Type: {this.state.asset.type}</p>
                    <br />
                    <BigCalendar
                        className="custom-calendar"
                        views={['month', 'week']}
                        events={this.state.asset.events}
                    />
                </div>
            } else {
                assetContent =
                    <div className="empty">
                        <img className="icon" src={egoCursorHand} />
                        <p className="text">No data were found please add some more informations before continuing...</p>
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
            },
            {
                name: 'Properties',
                path: '/companies/' + this.props.match.params.cid + '/properties/',
                active: false,
            },
            {
                name: this.props.match.params.pid,
                path: '/companies/' + this.props.match.params.cid + '/properties/' + this.props.match.params.pid,
                active: true,
            },
            {
                name: 'Assets',
                path: '/companies/' + this.props.match.params.cid + '/properties/' + this.props.match.params.pid + '/assets',
                active: false,
            },
            {
                name: this.props.match.params.aid,
                path: '/companies/' + this.props.match.params.cid + '/properties/' + this.props.match.params.pid + '/assets/' + this.props.match.params.aid,
                active: true,
            },
        ]

        return (
            <section className="asset-detail">
                <div className="content">
                    <Breadcrumbs routes={routes} />
                    <button className="custom-button" onClick={this.manageAssetOnRequestOpen}>
                        <img className="icon" src={egoPenChecklist} />
                        <span className="text">Manage asset</span>
                    </button>
                    <button className="custom-button" onClick={this.addStayOnRequestOpen}>
                        <img className="icon" src={egoPenChecklist} />
                        <span className="text">Add stay</span>
                    </button>
                    <Modal
                        isOpen={this.state.manageAssetModalIsOpen}
                        onRequestClose={this.manageAssetOnRequestClose}
                        style={manageAssetModalStyles}
                        contentLabel="Modal">
                        <div className="modal-header">
                            <h1 className="title">Manage asset</h1>
                            <img className="close" src={egoAxe} onClick={this.manageAssetOnRequestClose} />
                        </div>
                        <div className="modal-content">
                            <img className="visual-tip" src={egoCheckHexagon} />
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                            <form>
                                <table>
                                    <tbody>
                                        <tr>
                                            <td className="label"><label>Description:</label></td>
                                            <td><input className="value" type="text" value={this.state.asset.description} onChange={(e) => this.manageAssetHandleChanges('description', e)} /></td>
                                        </tr>
                                        <tr>
                                            <td className="label"><label>Type:</label></td>
                                            <td><input className="value" type="text" value={this.state.asset.type} onChange={(e) => this.manageAssetHandleChanges('type', e)} /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </form>
                        </div>
                        <div className="modal-actions">
                            <button className="action" onClick={(e) => this.upsertAsset(e)}>Save</button>
                            <button className="action close" onClick={this.manageAssetOnRequestClose}>Close</button>
                        </div>
                    </Modal>
                    <Modal
                        isOpen={this.state.addStayModalIsOpen}
                        onRequestClose={this.addStayOnRequestClose}
                        style={manageAssetModalStyles}
                        contentLabel="Modal">
                        <div className="modal-header">
                            <h1 className="title">Add stay</h1>
                            <img className="close" src={egoAxe} onClick={this.addStayOnRequestClose} />
                        </div>
                        <div className="modal-content">
                            <img className="visual-tip" src={egoCheckHexagon} />
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                            <DateRange
                                className="select-range"
                                calendars={1}
                                onInit={this.handleDateRangeSelect}
                                onChange={this.handleDateRangeSelect}
                            />
                            <p>Arrival: {this.state.dateRange.startDate && this.state.dateRange.startDate.format('dddd, D MMMM YYYY').toString()}</p>
                            <p>Departure: {this.state.dateRange.endDate && this.state.dateRange.endDate.format('dddd, D MMMM YYYY').toString()}</p>
                        </div>
                        <div className="modal-actions">
                            <button className="action" onClick={(e) => this.addStay(e)}>Save</button>
                            <button className="action close" onClick={this.addStayOnRequestClose}>Close</button>
                        </div>
                    </Modal>
                    {assetContent}
                </div>
            </section>
        );
    }
}

export default AssetDetail;