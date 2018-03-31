const contract = require('truffle-contract');
const CompanyContract = require('../build/contracts/Company.json');
const companyContract = contract(CompanyContract);
const web3 = window['web3'];
import store from '../store';

class CompanyService {
    private _instance: Promise<any>;
    private _companyContractAddress: string;

    public init(contractAddress: string) {
        companyContract.setProvider(web3.currentProvider);
        this._companyContractAddress = contractAddress;
    }

    public getInstance(): Promise<any> {
        if (!this._instance) {
            this._instance = companyContract.at(this._companyContractAddress);
            this._instance.then((instance) => {
                // instance.PropertyCreated('latest').watch((error: Error, result: any) => {
                //     store.dispatch({ type: 'company/FETCH_PROPERTIES' });
                //     console.log(result);
                // });
            });
        }
        return this._instance;
    }

    public async getProperties() {
        const instance = await this.getInstance();
        const properties = await instance.getProperties.call();
        store.dispatch({ type: 'company/PROPERTIES_FETCHED', payload: properties });
        return properties;
    }

    public async addProperty(name: string, context: any, cb: () => void) {
        const instance = await this.getInstance();
        return await instance.addProperty(name, { from: context.web3.selectedAccount });
    }
}

export default new CompanyService();