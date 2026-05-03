import { PropsWithChildren, useEffect } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

export default function ModalForm({
    submitRoute = '',
    updateRoute = '',
    label = 'Form',
    show = false,
    isEditing = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    onSubmitCallback = () => {},
    formValues = {},
    formContent = () => {},
}: PropsWithChildren<{
    submitRoute: string;
    updateRoute: string;
    label: string;
    show: boolean;
    isEditing: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    closeable?: boolean;
    onClose: CallableFunction;
    onSubmitCallback: CallableFunction;
    formValues: any;
    formContent: CallableFunction;
}>) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const submit = () => {
        if (isEditing) {
            put(updateRoute, {
                onSuccess: () => onSubmitCallback(),
            });
            return;
        }

        post(submitRoute, {
            onSuccess: () => onSubmitCallback(),
        });
    };

    const { data, setData, post, put, processing, errors, reset } = useForm(formValues);

    useEffect(() => {
        if (show) {
            reset();
            setData(formValues);
        }
    }, [show, formValues]);

    return (
        <Modal show={show} onClose={onClose} maxWidth={maxWidth}>
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                    <button
                        type="button"
                        onClick={close}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
                    {formContent(data, setData, errors)}
                    <div className="md:col-span-2">
                        <PrimaryButton disabled={processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
