import * as React from 'react';
import './index.css';

const contract = require('truffle-contract');
const CompanyContract = require('../../truffle-build/contracts/Company.json');
const companyContract = contract(CompanyContract);

export namespace Company {
    export interface Props {
        web3: any;
        id: string;
    }

    export interface State {
        company: any;
        balance: number;
    }
}

class Company extends React.Component<Company.Props, Company.State> {
    constructor(props?: Company.Props, context?: any) {
        super(props, context);

        this.state = {
            company: {
                name: ''
            },
            balance: -1
        };
    }

    componentWillMount() {
        this.getPartial();
    }

    getPartial() {
        companyContract.setProvider(this.props.web3.currentProvider);
        var companyInstance: any;
        this.props.web3.eth.getAccounts((error: any, accounts: any) => {
            companyContract.at(this.props.id).then((instance: any) => {
                companyInstance = instance;

                return companyInstance.getName.call();
            }).then((result: any) => {
                console.log(result);
                // this.setState({
                //     company: {
                //         name: result[0]
                //     }
                // });
                return companyInstance.getBalance.call();
            }).then((result: any) => {
                this.setState({
                    balance: this.props.web3.utils.fromWei(result.toNumber())
                });
            });
        });
    }

    render() {
        return (
            <section className="property">
                <div className="description">
                    <span className="address">address: {this.props.id}</span>
                    <span className="balance">balance: {this.state.balance} ether</span>
                    <p className="name">{this.state.company.name}</p>
                </div>
            </section>
        );
    }
}

export default Company;