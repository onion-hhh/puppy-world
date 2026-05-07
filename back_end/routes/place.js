// routes/place.js
const express = require('express');
const router = express.Router();
const PlaceController = require('../controllers/placeController');
const auth = require('../middleware/auth');

// GET /api/place/list - 获取地点列表
router.get('/list', PlaceController.getPlaceList);

// GET /api/place/detail - 获取地点详情
router.get('/detail', PlaceController.getPlaceDetail);

// POST /api/place/collect - 收藏地点（需要认证）
router.post('/collect', auth, PlaceController.collectPlace);

// POST /api/place/cancel-collect - 取消收藏（需要认证）
router.post('/cancel-collect', auth, PlaceController.cancelCollect);

// GET /api/place/nearby - 获取附近地点
router.get('/nearby', PlaceController.getNearbyPlaces);

// 导出路由模块
module.exports = router;