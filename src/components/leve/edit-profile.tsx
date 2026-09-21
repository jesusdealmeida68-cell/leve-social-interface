import { Camera } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { updateProfile, uploadMedia, type Profile } from "@/lib/leve";
import { Avatar } from "./primitives";

export function EditProfileDialog({
  open,
  onClose,
  person,
}: {
  open: boolean;
  onClose: () => void;
  person: Profile;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-y-auto rounded-3xl p-0">
        {open && <EditProfileForm person={person} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditProfileForm({ person, onClose }: { person: Profile; onClose: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(person.avatar_url);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(person.cover_url);
  const [name, setName] = useState(person.name);
  const [bio, setBio] = useState(person.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const pickAvatar = (file: File | null) => {
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : person.avatar_url);
  };
  const pickCover = (file: File | null) => {
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : person.cover_url);
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Precisas de entrar.");
      const values: Parameters<typeof updateProfile>[1] = {
        name: name.trim() || person.name,
        bio: bio.trim(),
      };
      if (avatarFile) {
        const uploaded = await uploadMedia(avatarFile, user.id);
        values.avatar_url = uploaded.url;
      }
      if (coverFile) {
        const uploaded = await uploadMedia(coverFile, user.id);
        values.cover_url = uploaded.url;
      }
      await updateProfile(user.id, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-by-username"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Algo correu mal."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    save.mutate();
  };

  return (
    <form onSubmit={submit}>
      <DialogHeader className="px-5 pt-5 text-left">
        <DialogTitle className="font-display text-xl">Editar perfil</DialogTitle>
        <DialogDescription>
          Muda a tua foto de capa, a foto de perfil e a tua bio.
        </DialogDescription>
      </DialogHeader>

      <input
        ref={coverInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => pickCover(event.target.files?.[0] ?? null)}
      />
      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => pickAvatar(event.target.files?.[0] ?? null)}
      />

      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          aria-label="Mudar foto de capa"
          className="group relative block h-36 w-full overflow-hidden bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {coverPreview && (
            <img
              src={coverPreview}
              alt=""
              className="size-full object-cover"
              width={1200}
              height={400}
            />
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="grid size-10 place-items-center rounded-full bg-black/55 text-white">
              <Camera className="size-5" />
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => avatarInput.current?.click()}
          aria-label="Mudar foto de perfil"
          className="group absolute -bottom-10 left-5 rounded-full border-4 border-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar person={{ ...person, avatar_url: avatarPreview }} size="lg" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-5 text-white" />
          </span>
        </button>
      </div>

      <div className="space-y-3 px-5 pb-5 pt-12">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Nome</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="h-11 w-full rounded-2xl bg-secondary px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Fala um pouco sobre ti..."
            className="min-h-20 w-full resize-none rounded-2xl bg-secondary p-4 text-sm leading-6 outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </label>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={save.isPending} className="h-11 w-full rounded-full">
          {save.isPending ? "A guardar..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
