import { Plus } from "lucide-react";
import { me, storyPeople } from "./data";
import { Avatar } from "./primitives";

/** Página "História": todas as histórias das últimas 24 horas numa grelha. */
export function Stories({
  onStory,
  onCreate,
}: {
  onStory: (index: number) => void;
  onCreate: () => void;
}) {
  return (
    <div className="mx-auto max-w-[960px] px-4 pb-8 pt-5 sm:px-6 lg:pt-8">
      <header className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Histórias</h1>
          <p className="mt-1 text-sm text-muted-foreground">Desaparecem ao fim de 24 horas.</p>
        </div>
      </header>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <li>
          <button
            type="button"
            onClick={onCreate}
            className="group flex aspect-[3/5] w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-muted-foreground/40 bg-card transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Plus className="size-6" />
            </span>
            <span className="text-sm font-semibold">Nova história</span>
          </button>
        </li>
        {storyPeople.map((person, index) => {
          const mine = person.handle === me.handle;
          return (
            <li key={person.handle}>
              <button
                type="button"
                onClick={() => onStory(index)}
                aria-label={mine ? "Ver a sua história" : `Ver história de ${person.name}`}
                className="group relative block aspect-[3/5] w-full overflow-hidden rounded-3xl bg-card text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {person.image && (
                  <img
                    src={person.image}
                    alt=""
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width={1200}
                    height={1504}
                  />
                )}
                <span className="absolute inset-0 bg-story-overlay" aria-hidden="true" />
                <span className="absolute left-3 top-3 rounded-full bg-story p-[2px]">
                  <span className="block rounded-full bg-background p-[2px]">
                    <Avatar person={person} size="sm" />
                  </span>
                </span>
                <span className="absolute inset-x-4 bottom-4 leading-tight">
                  <span className="block truncate text-sm font-bold">
                    {mine ? "Sua história" : person.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-foreground/70">Há {index + 1} h</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
