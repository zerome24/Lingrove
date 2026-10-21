import time
import datetime
import requests
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models import LearningModule, LearningProgress, User, UserBadge
from backend.app.schemas import (
    LearningModuleOut, LearningProgressUpdate, LearningProgressOut,
    UserBadgeOut, YouTubeVideoItem
)
from backend.app.auth import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/learning", tags=["Learning"])

# In-memory cache for YouTube searches: query_key -> (timestamp, List[YouTubeVideoItem])
VIDEO_CACHE: Dict[str, tuple[float, List[Dict[str, Any]]]] = {}
CACHE_TTL_SECONDS = 3600 * 12  # 12 hours cache to conserve API quota

# Curated, verified educational bamboo craft & machinery YouTube videos
CURATED_BAMBOO_VIDEOS = [
    {
        "video_id": "1sz1AlNKzUs",
        "title": "Electric Bamboo Cutter: Effortless Bamboo and Tree Trimming",
        "channel_title": "CMRTC Rural Technology Wing",
        "category": "Bamboo Cutting",
        "description": "Safe operation of high-speed carbide cutter for mature bamboo culm cross-cutting without fiber splintering.",
        "thumbnail_url": "https://i.ytimg.com/vi/1sz1AlNKzUs/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=1sz1AlNKzUs",
        "embed_url": "https://www.youtube-nocookie.com/embed/1sz1AlNKzUs",
        "is_live_api": False
    },
    {
        "video_id": "LJ2l_QvtfNY",
        "title": "Precision Bamboo Cross-Cutting & Slicing Process",
        "channel_title": "Bamboo Engineering Tech",
        "category": "Bamboo Cutting",
        "description": "Demonstration of clean node cross-cutting and sizing protocols for rural bamboo workshops.",
        "thumbnail_url": "https://i.ytimg.com/vi/LJ2l_QvtfNY/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=LJ2l_QvtfNY",
        "embed_url": "https://www.youtube-nocookie.com/embed/LJ2l_QvtfNY",
        "is_live_api": False
    },
    {
        "video_id": "7vCeeOWfuAY",
        "title": "Heavy-Duty Radial Bamboo Splitting Machine Demonstration",
        "channel_title": "National Bamboo Machinery",
        "category": "Bamboo Splitting",
        "description": "Hydraulic ram pushing raw round bamboo culms through 8-blade star cutters for uniform longitudinal splits.",
        "thumbnail_url": "https://i.ytimg.com/vi/7vCeeOWfuAY/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=7vCeeOWfuAY",
        "embed_url": "https://www.youtube-nocookie.com/embed/7vCeeOWfuAY",
        "is_live_api": False
    },
    {
        "video_id": "cg-0mUvIg_k",
        "title": "Bamboo Splitting Machine: Power, Alignment & Precision",
        "channel_title": "Rural Artisan Guild",
        "category": "Bamboo Splitting",
        "description": "Radial splitting along natural grain cleavage with blade centering and safety spacing.",
        "thumbnail_url": "https://i.ytimg.com/vi/cg-0mUvIg_k/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=cg-0mUvIg_k",
        "embed_url": "https://www.youtube-nocookie.com/embed/cg-0mUvIg_k",
        "is_live_api": False
    },
    {
        "video_id": "rvja5Y2Mj_A",
        "title": "Automatic Bamboo Strip Cutting & Slicing Machine",
        "channel_title": "CMRTC Bamboo Technology Cell",
        "category": "Bamboo Slicing",
        "description": "Feeding split bamboo strips to strip the outer green epidermis and shave calibrated 1.2mm flexible weaving ribbons.",
        "thumbnail_url": "https://i.ytimg.com/vi/rvja5Y2Mj_A/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=rvja5Y2Mj_A",
        "embed_url": "https://www.youtube-nocookie.com/embed/rvja5Y2Mj_A",
        "is_live_api": False
    },
    {
        "video_id": "MH3Pv1Aulk8",
        "title": "Precision Bamboo Strip Calibration & Profiling",
        "channel_title": "Craft Tools & Machinery",
        "category": "Bamboo Slicing",
        "description": "Processing calibrated bamboo strips with uniform thickness and edge deburring for craft weaving.",
        "thumbnail_url": "https://i.ytimg.com/vi/MH3Pv1Aulk8/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=MH3Pv1Aulk8",
        "embed_url": "https://www.youtube-nocookie.com/embed/MH3Pv1Aulk8",
        "is_live_api": False
    },
    {
        "video_id": "qI27XVrPhlA",
        "title": "Weaving Bamboo Baskets: Sustainable Craft for Eco Storage",
        "channel_title": "Lingala Village Crafts",
        "category": "Basket Making",
        "description": "Master weaver demonstrates interlocking base construction, wall rising, twill weaving, and circular rim binding.",
        "thumbnail_url": "https://i.ytimg.com/vi/qI27XVrPhlA/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=qI27XVrPhlA",
        "embed_url": "https://www.youtube-nocookie.com/embed/qI27XVrPhlA",
        "is_live_api": False
    },
    {
        "video_id": "mQIi3buLii4",
        "title": "Traditional Bamboo Basket Weaving Tutorial",
        "channel_title": "Heritage Handcrafts",
        "category": "Basket Making",
        "description": "Comprehensive tutorial covering star base check weaving, bending warp stakes, and cane lashing.",
        "thumbnail_url": "https://i.ytimg.com/vi/mQIi3buLii4/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=mQIi3buLii4",
        "embed_url": "https://www.youtube-nocookie.com/embed/mQIi3buLii4",
        "is_live_api": False
    },
    {
        "video_id": "i2Sx2nKQV6I",
        "title": "Traditional Hand Fan Making with Bamboo Slivers (Visanakarra)",
        "channel_title": "Village Artisans Portal",
        "category": "Basket Making",
        "description": "Handcrafting traditional lightweight hand fans with fine bamboo strips and carved handles.",
        "thumbnail_url": "https://i.ytimg.com/vi/i2Sx2nKQV6I/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=i2Sx2nKQV6I",
        "embed_url": "https://www.youtube-nocookie.com/embed/i2Sx2nKQV6I",
        "is_live_api": False
    },
    {
        "video_id": "Ax2iLVLeVK4",
        "title": "Secret Bamboo Joint Technique: No Cracks, No Splits!",
        "channel_title": "Bamboo Carpentry Workshop",
        "category": "Furniture Making",
        "description": "Fish-mouth saddle cuts, dowel reinforcement, and mortise pin fastening for rigid stools and tables.",
        "thumbnail_url": "https://i.ytimg.com/vi/Ax2iLVLeVK4/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=Ax2iLVLeVK4",
        "embed_url": "https://www.youtube-nocookie.com/embed/Ax2iLVLeVK4",
        "is_live_api": False
    },
    {
        "video_id": "uRPyHN2vYA4",
        "title": "Handcrafted Bamboo Furniture Design & Joinery",
        "channel_title": "CMRTC Bamboo Design Lab",
        "category": "Furniture Making",
        "description": "Ergonomic seating frame construction using cured Dendrocalamus culms and pinned joints.",
        "thumbnail_url": "https://i.ytimg.com/vi/uRPyHN2vYA4/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=uRPyHN2vYA4",
        "embed_url": "https://www.youtube-nocookie.com/embed/uRPyHN2vYA4",
        "is_live_api": False
    },
    {
        "video_id": "Zc7G5eN4N3g",
        "title": "How to Make Borax Based Bamboo Treatment Solution",
        "channel_title": "CMRTC Bamboo Incubation",
        "category": "Finishing Techniques",
        "description": "Preventing powder-post beetle and fungal decay using non-hazardous Borax and Boric acid dip treatment.",
        "thumbnail_url": "https://i.ytimg.com/vi/Zc7G5eN4N3g/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=Zc7G5eN4N3g",
        "embed_url": "https://www.youtube-nocookie.com/embed/Zc7G5eN4N3g",
        "is_live_api": False
    },
    {
        "video_id": "Y7XpBSNaR9w",
        "title": "Treating & Preserving Bamboo for Construction & Craft",
        "channel_title": "Sustainable Eco Materials",
        "category": "Finishing Techniques",
        "description": "Drying rack protocols, sap extraction, and natural oil waxing for durable bamboo products.",
        "thumbnail_url": "https://i.ytimg.com/vi/Y7XpBSNaR9w/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=Y7XpBSNaR9w",
        "embed_url": "https://www.youtube-nocookie.com/embed/Y7XpBSNaR9w",
        "is_live_api": False
    },
    {
        "video_id": "hT3w5NgbOf8",
        "title": "Bamboo Rough Planning & Surface Working Machine",
        "channel_title": "CMRTC Safety & Engineering Division",
        "category": "Machine Maintenance",
        "description": "Essential workshop safety: eye protection, blade guard calibration, linear rail lubrication, and daily maintenance routines.",
        "thumbnail_url": "https://i.ytimg.com/vi/hT3w5NgbOf8/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=hT3w5NgbOf8",
        "embed_url": "https://www.youtube-nocookie.com/embed/hT3w5NgbOf8",
        "is_live_api": False
    },
    {
        "video_id": "EvrgzATwJ50",
        "title": "Workshop Machinery Safety Protocols & Blade Maintenance",
        "channel_title": "CMRTC Mechanical Workshop",
        "category": "Machine Maintenance",
        "description": "Preventive inspection, emergency cut-offs, dust extraction, and electrical safety standards for rural workshops.",
        "thumbnail_url": "https://i.ytimg.com/vi/EvrgzATwJ50/hqdefault.jpg",
        "watch_url": "https://www.youtube.com/watch?v=EvrgzATwJ50",
        "embed_url": "https://www.youtube-nocookie.com/embed/EvrgzATwJ50",
        "is_live_api": False
    }
]

@router.get("/videos", response_model=List[YouTubeVideoItem])
def search_learning_videos(
    category: Optional[str] = None,
    module_title: Optional[str] = None,
    query: Optional[str] = None,
    language: Optional[str] = "en"
):
    """
    Discovers educational bamboo crafting and machinery tutorials using YouTube Data API v3
    with local caching and curated fallback when the API key is not configured or quota is reached.
    """
    search_term = query or module_title or category or "bamboo craft machine"
    cache_key = f"{search_term.lower().strip()}_{language}"

    # Check cache
    if cache_key in VIDEO_CACHE:
        cached_time, cached_items = VIDEO_CACHE[cache_key]
        if time.time() - cached_time < CACHE_TTL_SECONDS:
            return cached_items

    # If YouTube API Key is configured, attempt live discovery
    if settings.YOUTUBE_API_KEY:
        try:
            # Craft educational search query
            q_str = f"bamboo {search_term} demonstration tutorial"
            if language == "te":
                q_str += " telugu or english"
            elif language == "hi":
                q_str += " hindi or english"

            resp = requests.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={
                    "part": "snippet",
                    "type": "video",
                    "videoEmbeddable": "true",
                    "maxResults": 6,
                    "q": q_str,
                    "key": settings.YOUTUBE_API_KEY
                },
                timeout=5.0
            )

            if resp.status_code == 200:
                data = resp.json()
                items = data.get("items", [])
                results = []
                for it in items:
                    vid_id = it["id"].get("videoId")
                    if not vid_id:
                        continue
                    snippet = it.get("snippet", {})
                    results.append({
                        "video_id": vid_id,
                        "title": snippet.get("title", ""),
                        "channel_title": snippet.get("channelTitle", ""),
                        "description": snippet.get("description", ""),
                        "thumbnail_url": (
                            snippet.get("thumbnails", {}).get("high", {}).get("url")
                            or snippet.get("thumbnails", {}).get("medium", {}).get("url")
                            or "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80"
                        ),
                        "published_at": snippet.get("publishedAt"),
                        "watch_url": f"https://www.youtube.com/watch?v={vid_id}",
                        "embed_url": f"https://www.youtube-nocookie.com/embed/{vid_id}",
                        "is_live_api": True
                    })

                if results:
                    VIDEO_CACHE[cache_key] = (time.time(), results)
                    return results
            else:
                print(f"YouTube Data API notice (HTTP {resp.status_code}): {resp.text[:120]}. Using curated educational library.")
        except Exception as e:
            print(f"YouTube API call exception: {e}. Falling back to curated educational library.")

    # Curated fallback library filtering
    filtered = []
    cat_lower = (category or "").lower()
    search_lower = search_term.lower()

    for v in CURATED_BAMBOO_VIDEOS:
        if cat_lower and cat_lower in v["category"].lower():
            filtered.append(v)
        elif search_lower and (search_lower in v["title"].lower() or search_lower in v["category"].lower() or search_lower in v["description"].lower()):
            filtered.append(v)

    if not filtered:
        filtered = CURATED_BAMBOO_VIDEOS[:4]

    VIDEO_CACHE[cache_key] = (time.time(), filtered)
    return filtered

@router.get("/modules", response_model=List[LearningModuleOut])
def list_modules(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(LearningModule)

    if category and category != "all":
        query = query.filter(LearningModule.category.ilike(f"%{category}%"))

    if difficulty and difficulty != "all":
        query = query.filter(LearningModule.difficulty == difficulty.lower())

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                LearningModule.title.ilike(pattern),
                LearningModule.summary.ilike(pattern),
                LearningModule.category.ilike(pattern)
            )
        )

    modules = query.all()
    results = []

    for m in modules:
        prog_out = None
        if current_user:
            prog = db.query(LearningProgress).filter(
                LearningProgress.user_id == current_user.id,
                LearningProgress.module_id == m.id
            ).first()
            if prog:
                prog_out = LearningProgressOut.from_orm(prog)

        m_dict = {
            "id": m.id,
            "title": m.title,
            "category": m.category,
            "difficulty": m.difficulty,
            "estimated_duration": m.estimated_duration,
            "thumbnail_url": m.thumbnail_url,
            "video_url": m.video_url,
            "is_demo": m.is_demo,
            "summary": m.summary,
            "learning_objectives": m.learning_objectives,
            "steps_content": m.steps_content,
            "safety_precautions": m.safety_precautions,
            "downloadable_guide_url": m.downloadable_guide_url,
            "created_at": m.created_at,
            "user_progress": prog_out
        }
        results.append(m_dict)

    return results

@router.get("/modules/{module_id}", response_model=LearningModuleOut)
def get_module(
    module_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    m = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Learning module not found")

    prog_out = None
    if current_user:
        prog = db.query(LearningProgress).filter(
            LearningProgress.user_id == current_user.id,
            LearningProgress.module_id == m.id
        ).first()
        if prog:
            prog_out = LearningProgressOut.from_orm(prog)

    return {
        "id": m.id,
        "title": m.title,
        "category": m.category,
        "difficulty": m.difficulty,
        "estimated_duration": m.estimated_duration,
        "thumbnail_url": m.thumbnail_url,
        "video_url": m.video_url,
        "is_demo": m.is_demo,
        "summary": m.summary,
        "learning_objectives": m.learning_objectives,
        "steps_content": m.steps_content,
        "safety_precautions": m.safety_precautions,
        "downloadable_guide_url": m.downloadable_guide_url,
        "created_at": m.created_at,
        "user_progress": prog_out
    }

@router.post("/modules/{module_id}/progress", response_model=LearningProgressOut)
@router.put("/modules/{module_id}/progress", response_model=LearningProgressOut)
def update_progress(
    module_id: int,
    progress_in: LearningProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = db.query(LearningModule).filter(LearningModule.id == module_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Learning module not found")

    progress = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id,
        LearningProgress.module_id == module_id
    ).first()

    if not progress:
        progress = LearningProgress(
            user_id=current_user.id,
            module_id=module_id,
            progress_percentage=0,
            is_completed=False,
            bookmarked=False
        )
        db.add(progress)

    if progress_in.bookmarked is not None:
        progress.bookmarked = progress_in.bookmarked

    if progress_in.progress_percentage is not None:
        progress.progress_percentage = progress_in.progress_percentage

    if progress_in.is_completed is not None:
        progress.is_completed = progress_in.is_completed
        if progress_in.is_completed:
            progress.progress_percentage = 100
            progress.completed_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(progress)

    # Award milestone badges
    completed_count = db.query(LearningProgress).filter(
        LearningProgress.user_id == current_user.id,
        LearningProgress.is_completed == True
    ).count()

    existing_badge_names = [b.badge_name for b in current_user.badges]

    if completed_count >= 1 and "First Bamboo Craft" not in existing_badge_names:
        db.add(UserBadge(
            user_id=current_user.id,
            badge_name="First Bamboo Craft",
            badge_description="Completed your very first hands-on Lingala bamboo tutorial!",
            badge_icon="Award"
        ))
        db.commit()

    if completed_count >= 3 and "CMRTC Certified Apprentice" not in existing_badge_names:
        db.add(UserBadge(
            user_id=current_user.id,
            badge_name="CMRTC Certified Apprentice",
            badge_description="Mastered three core bamboo processing techniques at CMRTC.",
            badge_icon="ShieldCheck"
        ))
        db.commit()

    return progress

@router.get("/badges", response_model=List[UserBadgeOut])
def get_user_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
