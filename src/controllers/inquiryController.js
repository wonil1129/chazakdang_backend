const express = require('express');
const inquiryService = require('../services/inquiryService');
const path = require('path');
const auth = require('../middleware/auth');
const { Console } = require('console');

exports.createInquiry = async (req, res) => {
    try {
        const result = await inquiryService.createInquiry(req.body);
        res.status(201).json({ message: '문의가 성공적으로 생성되었습니다.', inquiryId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 생성에 실패했습니다.' });
    }
}

exports.getInquiriesList = async (req, res) => {
    const userId = req.user.id;
    console.log(userId);

    try {
        const inquiries = await inquiryService.getInquiriesList(userId);
        res.status(200).json(inquiries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 목록을 불러오지 못했습니다.' });
    }
};

exports.getInquiryById = async (req, res) => {
    const inquiryId = req.params.id;
    try {
        const inquiry = await inquiryService.getInquiryById(inquiryId);
        if (!inquiry) {
            return res.status(404).json({ message: '해당 ID의 문의를 찾을 수 없습니다.' });
        }
        res.status(200).json(inquiry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 내용을 불러오지 못했습니다.' });
    }
};