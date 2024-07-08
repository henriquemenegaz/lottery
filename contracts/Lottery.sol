// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public manager;
    address[] public participants;
    mapping(address => uint) public tickets;
    address public lastWinner;

    constructor() {
        manager = msg.sender;
    }

    function enter(uint numberOfTickets) public payable {
        require(numberOfTickets > 0, "You must buy at least one ticket");
        require(msg.value >= numberOfTickets * 1 gwei, "Insufficient Ether sent for the number of tickets");

        if (tickets[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        tickets[msg.sender] += numberOfTickets;
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function pickWinner() public onlyManager {
        require(participants.length > 0, "No participants in the lottery");

        uint totalTickets = 0;
        for (uint i = 0; i < participants.length; i++) {
            totalTickets += tickets[participants[i]];
        }

        uint randomIndex = random() % totalTickets;
        address winner;
        uint cumulativeTickets = 0;

        for (uint i = 0; i < participants.length; i++) {
            cumulativeTickets += tickets[participants[i]];
            if (cumulativeTickets > randomIndex) {
                winner = participants[i];
                break;
            }
        }

        lastWinner = winner;
        resetLottery();

        payable(winner).transfer(address(this).balance);
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, participants)));
    }

    function resetLottery() private {
        for (uint i = 0; i < participants.length; i++) {
            tickets[participants[i]] = 0;
        }
        // Reset the participants array to an empty array
        participants = new address[](0) ;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }
}
