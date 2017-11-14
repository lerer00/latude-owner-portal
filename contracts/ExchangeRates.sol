pragma solidity ^0.4.17;

import "./strings.sol";
import "./usingOraclize.sol";

contract ExchangeRates is usingOraclize {
    using strings for *;
    
    mapping(bytes32 => uint) rates; 
    mapping(bytes32 => bool) supportedCurrencies;

    function ExchangeRates() public payable {
        OAR = OraclizeAddrResolverI(0x6f485C8BF6fc43eA212E93BBF8ce046C7f1cb475);
        getCurrenciesRate();
    }

    function __callback(bytes32 myid, string currencies) public {
        // this flatten the whole string into an array ['l','a','t','u','d','e']
        var currenciesRateStringArray = currencies.toSlice();
        var currenciesDelimiter = "|".toSlice();
        uint numberOfParts = currenciesRateStringArray.count(currenciesDelimiter) + 1;
        // navigate through all parts that were seperated with an |
        for (uint i = 0; i < numberOfParts; i++) {
            var currency = currenciesRateStringArray.split(currenciesDelimiter).toString();    
            var currencyStringArray = currency.toSlice();
            // slice the CAD;398.05
            var currencyDelimeter = ";".toSlice();
            
            bytes32 sigle = stringToBytes32(currencyStringArray.split(currencyDelimeter).toString());
            string memory price = currencyStringArray.split(currencyDelimeter).toString();
            
            rates[sigle] = parseInt(price,2);
            supportedCurrencies[sigle] = true;
        }
        
        getCurrenciesRate();
    }

    function getCurrenciesRate() public payable {
        oraclize_query(60, "URL", "json(https://gnnbpjivgd.localtunnel.me/currency).rates");
    }

    function getCurrencyRate(bytes32 _currency) public view returns(uint) {
        return rates[_currency];
    }
    
    function isCurrencyAllowed(bytes32 _currency) public view returns(bool) {
        return supportedCurrencies[_currency];
    }
    
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
           return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}