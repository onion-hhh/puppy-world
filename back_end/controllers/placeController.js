// controllers/placeController.js
const Place = require('../models/Place');
const Collect = require('../models/Collect');
const result = require('../utils/result');

class PlaceController {
  // 获取地点列表
  static async getPlaceList(req, res) {
    try {
      const { type, page = 1, limit = 10 } = req.query;
      const places = await Place.getPlaceList({ type, page, limit });
      res.json(result.success(places));
    } catch (error) {
      res.json(result.error('获取地点列表失败'));
    }
  }

  // 获取地点详情
  static async getPlaceDetail(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        return res.json(result.error('缺少地点ID', 400));
      }
      const place = await Place.findById(id);
      if (!place) {
        return res.json(result.error('地点不存在'));
      }
      res.json(result.success(place));
    } catch (error) {
      res.json(result.error('获取地点详情失败'));
    }
  }

  // 收藏地点
  static async collectPlace(req, res) {
    try {
      const { placeId } = req.body;
      if (!placeId) {
        return res.json(result.error('缺少地点ID', 400));
      }
      const result = await Collect.create(req.userId, placeId);
      res.json(result.success(result));
    } catch (error) {
      res.json(result.error('收藏失败'));
    }
  }

  // 取消收藏
  static async cancelCollect(req, res) {
    try {
      const { placeId } = req.body;
      if (!placeId) {
        return res.json(result.error('缺少地点ID', 400));
      }
      const result = await Collect.delete(req.userId, placeId);
      res.json(result.success(result));
    } catch (error) {
      res.json(result.error('取消收藏失败'));
    }
  }

  // 获取附近地点
  static async getNearbyPlaces(req, res){
    try {
      const { lat, lng, radius = 5000, showAll = false} = req.query;
      if(!lat || !lng){
        return res.json(result.error('缺少经纬度', 400));
      }
      const places = await Place.getNearbyPlaces({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseFloat(radius),
        showAll: showAll === 'true'
      });
      res.json(result.success(places));
    } catch (error) {
      res.json(result.error('获取附近地点失败'));
    }
  }

}

module.exports = PlaceController;