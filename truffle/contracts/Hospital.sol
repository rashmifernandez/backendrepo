// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./NeuromedAccess.sol";

contract Hospital is NeuromedAccess{

    event HospitalAdded(bytes32 hsId);

    function addHospital(bytes32 _hospitalId)
        public onlyRole(NM_ADMIN){
        hopsital_ids.push(_hospitalId);
        emit HospitalAdded(_hospitalId);
    }

    function getAllHospitals()public view returns(bytes32[] memory){
        bytes32[] memory hs_id = new bytes32[](hopsital_ids.length);
        for(uint x = 0; x < hopsital_ids.length; x++){
            hs_id[x] = hopsital_ids[x];
        }
        return(hs_id);
    }

}