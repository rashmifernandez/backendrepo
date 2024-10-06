// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NeuromedAccess is Ownable, AccessControl{
    bytes32 public constant NM_ADMIN = keccak256("NM_ADMIN");
    bytes32 public constant HS_ADMIN = keccak256("HS_ADMIN");
    bytes32 public constant MREP = keccak256("MREP");
    bytes32 public constant DOCTOR = keccak256("DOCTOR");
    bytes32 public constant LAB_ASST = keccak256("LAB_ASST");
    bytes32 private NO_ROLE = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 public NO_HS = 0x39349db958ca58bbd5da126bd654d05d8d0c93f86805918f236dc076194e1955;

    mapping(address => bytes32) public roleOfUser;

    struct User{
        bytes32 id;
        bytes32 urole;
    }
    User[] users;

    mapping(address => User) addressOfUser;
    mapping(bytes32 => uint256) public userCountRole;
    mapping(bytes32 => User[]) public usersForARole;
    bytes32[] hopsital_ids;

    mapping(bytes32 => bytes32) hospitalIdForHsAdmin;
    mapping(bytes32 => bytes32) hospitalIdForLabAsst;

    struct Patient{
        bytes32 ptId;
        string nicno;
    }

    Patient[] patients;
    mapping(bytes32 => uint256) tokenIdforPatientId;

    event UserAdded(bytes32 userId, bytes32 userRole, address userAdd, bytes32 userHs);
    event UserRemoved(bytes32 userId, bytes32 userRole, address userAdd);

    constructor(){
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setRoleAdmin(NM_ADMIN, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(HS_ADMIN, NM_ADMIN);
        _setRoleAdmin(MREP, NM_ADMIN);
        _setRoleAdmin(DOCTOR, NM_ADMIN);
        _setRoleAdmin(LAB_ASST, HS_ADMIN);
    }

    function seeOwner()public view returns(address){
        return msg.sender;
    }

    function addUser
    (bytes32 _id, bytes32 _addingUser, address _address, bytes32 _hospitalId)
    public{
        require(roleOfUser[_address] == NO_ROLE, "User already has a Role");
        if(_hospitalId != NO_HS){
            require(hasHospital(_hospitalId), "Wrong HospitalID");
            if(_addingUser == HS_ADMIN){
                hospitalIdForHsAdmin[_id] = _hospitalId;
            }else if(_addingUser == LAB_ASST){
                hospitalIdForLabAsst[_id] = _hospitalId;
            }
        }
        User memory adding_user = User(_id, _addingUser);
        users.push(adding_user);
        addressOfUser[_address] = adding_user;
        grantRole(_addingUser, _address);
        roleOfUser[_address] = _addingUser;
        userCountRole[_addingUser] += 1;
        emit UserAdded(_id, _addingUser, _address, _hospitalId);
    }

    function removeUser(bytes32 _id, bytes32 _removingUser, address _address)public{
        require(addressOfUser[_address].id == _id, "ID Mismatch");
        for(uint x = 0; x < users.length; x++){
            if(users[x].id == _id){
                delete users[x];
                delete addressOfUser[_address];
                delete roleOfUser[_address];
                revokeRole(_removingUser, _address);
                userCountRole[_removingUser] -= 1;
                emit UserRemoved(_id, _removingUser, _address);
            }
        }
    }

    function hasHospital(bytes32 _hospitalId)
    internal view onlyRole(NM_ADMIN) returns(bool){
        bool val = false;
        for(uint x = 0; x < hopsital_ids.length; x++){
            if(hopsital_ids[x] == _hospitalId){
                val = true;
            }
        }
        return val;
    }

    function getAllUsers()
    public view returns(bytes32[] memory, bytes32[] memory){
        bytes32[] memory uid = new bytes32[](users.length);
        bytes32[] memory urole = new bytes32[](users.length);
        for(uint i = 0; i < users.length; i++){
            uid[i] = users[i].id;
            urole[i] = users[i].urole;
        }
        return (uid, urole);
    }

    function _checkRole(bytes32 role, address account) internal view virtual override{
        if (!hasRole(role, account)) {
            revert(string("Unauthorized: ACR"));
        }
    }

}