// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Hospital.sol";

contract NeuromedTasks is ERC721URIStorage, Hospital{

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct MedRecord{
        bytes32 mRecId;
        bool isCritical;
    }

    MedRecord[] medrecords;
    mapping(bytes32 => uint256) tokenIdforMedRecorddId;
    mapping(bytes32 => MedRecord[]) patientsMedRecs;

    struct LabReport{
        bytes32 lRepId;
    }

    LabReport[] labReports;
    mapping(bytes32 => uint256) tokenIdforLabReportId;
    mapping(bytes32 => LabReport[]) patientsLabReports;

    event PatientAdded(bytes32 ptId, string ptNic, string ptLink);
    event MedRecAdded(bytes32 mRecId, bool isCritical, string tokenURI, bytes32 ptId);
    event LabRepAdded(bytes32 lRepId, string tokenURI, bytes32 ptId);

    constructor() ERC721("NM_Contract", "NMC") {

    }

    function registerPatient
    (bytes32 _ptId, string memory _ptNic, string memory _tokenURI) 
    public onlyRole(MREP){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        tokenIdforPatientId[_ptId] = newItemId;
        patients.push(Patient(_ptId, _ptNic));
        mintNFT(newItemId, msg.sender, _tokenURI);
        emit PatientAdded(_ptId, _ptNic, _tokenURI);
    }

    function addMedicalrecord
    (bytes32 _mRecId, bool _isCritical, string memory _tokenURI, bytes32 _ptId)
    public onlyRole(DOCTOR){
        MedRecord memory med_record = MedRecord(_mRecId, _isCritical);
         _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        tokenIdforMedRecorddId[_mRecId] = newItemId;
        medrecords.push(med_record);
        mintNFT(newItemId, msg.sender, _tokenURI);
        patientsMedRecs[_ptId].push(med_record);
        emit MedRecAdded(_mRecId, _isCritical, _tokenURI, _ptId);
    }

    function addLabReport
    (bytes32 _lRepId, string memory _tokenURI, bytes32 _ptId)
    public onlyRole(LAB_ASST){
        LabReport memory lab_report = LabReport(_lRepId);
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        tokenIdforLabReportId[_lRepId] = newItemId;
        labReports.push(lab_report);
        mintNFT(newItemId, msg.sender, _tokenURI);
        patientsLabReports[_ptId].push(lab_report);
        emit LabRepAdded(_lRepId, _tokenURI, _ptId);
    }

    function mintNFT(uint256 newItemId, address recipient, string memory tokenURI)
    internal returns (uint256){
       _mint(recipient, newItemId);
       _setTokenURI(newItemId, tokenURI);
       return newItemId;
    }

    function getPatientURI(bytes32 _ptId)
    public onlyRole(DOCTOR) view returns(string memory){
        return tokenURI(tokenIdforPatientId[_ptId]);
    }

    function getMedRecsForPatient(bytes32 _ptId)
    public onlyRole(DOCTOR) view returns(string[] memory, bool[] memory){
        MedRecord[] memory medRecs = patientsMedRecs[_ptId];
        string[] memory mrec_uris = new string[](medRecs.length);
        bool[] memory mrec_iscric = new bool[](medRecs.length);
        for(uint x = 0; x < medRecs.length; x++){
            uint token_id = tokenIdforMedRecorddId[medRecs[x].mRecId];
            mrec_uris[x] = tokenURI(token_id);
            mrec_iscric[x] = medRecs[x].isCritical;
        }
        return (mrec_uris, mrec_iscric);
    }

    function getMedRecsURIs(MedRecord[] memory medRecs)
    internal view returns(string[] memory){
        string[] memory mrec_uris = new string[](medRecs.length);
        for(uint x = 0; x < medRecs.length; x++){
            uint token_id = tokenIdforMedRecorddId[medRecs[x].mRecId];
            mrec_uris[x] = tokenURI(token_id);
        }
        return mrec_uris;
    }

    function getLabRepsForPatient(bytes32 _ptId)
    public onlyRole(LAB_ASST) view returns(string[] memory){
        LabReport[] memory labRecs = patientsLabReports[_ptId];
        string[] memory lrec_uris = new string[](labRecs.length);
        for(uint x = 0; x < labRecs.length; x++){
            uint token_id = tokenIdforLabReportId[labRecs[x].lRepId];
            lrec_uris[x] = tokenURI(token_id);
        }
        return lrec_uris;
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId) public view override
        (ERC721, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}