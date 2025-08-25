const express = require('express');
const inquiryService = require('../services/inquiryService');
const path = require('path');
const auth = require('../middleware/auth');
const { Console } = require('console');

exports.createInquiry = async (req, res) => {
    const userId = req.user.id; // 인증 미들웨어에서 설정한 사용자 정보
    const { inquiry_type, title, content } = req.body;

    // 생성 검증
    const { error } = inquiryService.inquiryCreateSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: "값이 부족해요" });
    }

    try {
        const result = await inquiryService.createInquiry(inquiry_type, title, content, userId);
        res.status(201).json({ message: '문의가 성공적으로 생성되었습니다.', inquiryId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 생성에 실패했습니다.' });
    }
}

exports.deleteInquiry = async (req, res) => {
    const inquiryId = req.params.id;
    const userId = req.user.id; // 인증 미들웨어에서 설정한 사용자 정보 

    try {
        const result = await inquiryService.deleteInquiry(inquiryId, userId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '해당 ID의 문의를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '문의가 성공적으로 삭제되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 삭제에 실패했습니다.' });
    }
}

exports.updateInquiry = async (req, res) => {
    const inquiryId = req.params.id;
    const userId = req.user.id;
    const updateFields = req.body; // body에 들어온 값만 전달

    // 수정 검증
    const { error } = inquiryService.inquiryUpdateSchema.validate(updateFields);
    if (error) {
        return res.status(400).json({ message: "최소 한 개의 수정값이 필요합니다." });
    }

    try {
        const result = await inquiryService.updateInquiry(inquiryId, userId, updateFields);
        res.status(200).json({ message: '문의가 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 오류로 인해 문의 수정에 실패했습니다.' });
    }
}

exports.getInquiriesList = async (req, res) => {
    const userId = req.user.id;

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