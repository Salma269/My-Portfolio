import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale, LocaleStatus, ProjectImage } from '../../types/cms';
import { pickLocalized } from '../../utils/localize';

type Props = {
  images: ProjectImage[];
  locale: Locale;
  localeStatus?: LocaleStatus;
  className?: string;
};

export function ProjectImageCarousel({ images, locale, localeStatus, className = '' }: Props) {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  if (images.length === 0) return null;

  const altFor = (image: ProjectImage) => pickLocalized(image.alt, locale, localeStatus, true);

  if (images.length === 1) {
    return (
      <div className={`project-hero-carousel project-hero-carousel--single ${className}`.trim()}>
        <img src={images[0].blobUrl} alt={altFor(images[0])} />
      </div>
    );
  }

  return (
    <div className={`project-hero-carousel ${className}`.trim()}>
      <div className="project-hero-carousel__viewport" ref={emblaRef}>
        <div className="project-hero-carousel__container">
          {images.map((image, index) => (
            <div className="project-hero-carousel__slide" key={image.id}>
              <img
                src={image.blobUrl}
                alt={altFor(image)}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="project-hero-carousel__controls">
        <button className="circle-button" type="button" onClick={scrollPrev} disabled={!canScrollPrev} aria-label={t('actions.previous')}>
          ‹
        </button>
        <div className="project-hero-carousel__dots" role="tablist" aria-label={t('labels.projectGallery')}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`${t('actions.next')} ${index + 1}`}
              className={index === selectedIndex ? 'is-active' : ''}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
        <button className="circle-button" type="button" onClick={scrollNext} disabled={!canScrollNext} aria-label={t('actions.next')}>
          ›
        </button>
      </div>
    </div>
  );
}
