import { useContext, useEffect, useState } from "react";
import { AppContext } from '../../context/AppContext';
import axios from "axios";
import { toast } from "react-toastify";
import Loading from '../../components/student/Loading';
import { useNavigate } from "react-router-dom";

const statusStyles = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-700',
};

const MyCourses = () => {
  const {
    backendUrl,
    isEducator,
    currency,
    getToken
  } = useContext(AppContext);

  const [courses, setCourses] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get(
        backendUrl + '/api/educator/courses',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    }
  };

  const updateCourseStatus = async (courseId, action) => {
    try {
      setActionLoading(`${action}-${courseId}`);

      const token = await getToken();

      let endpoint;
      let method;

      switch (action) {
        case 'publish':
          endpoint = `/api/educator/courses/${courseId}/publish`;
          method = 'patch';
          break;

        case 'unpublish':
          endpoint = `/api/educator/courses/${courseId}/unpublish`;
          method = 'patch';
          break;

        case 'archive':
          endpoint = `/api/educator/courses/${courseId}`;
          method = 'delete';
          break;

        default:
          throw new Error('Invalid course action');
      }

      const { data } = await axios({
        method,
        url: backendUrl + endpoint,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        toast.success(data.message);

        await fetchEducatorCourses();
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = (courseId) => {
    const confirmed = window.confirm(
      'Are you sure you want to archieve this course?'
    );

    if (!confirmed) {
      return;
    }

    updateCourseStatus(courseId, 'archive');
  };

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses();
    }
  }, [isEducator]);
  
  return courses ? (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">
          My Courses
        </h2>

        <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">
                  Course
                </th>

                <th className="px-4 py-3 font-semibold truncate">
                  Earnings
                </th>

                <th className="px-4 py-3 font-semibold truncate">
                  Students
                </th>

                <th className="px-4 py-3 font-semibold truncate">
                  Status
                </th>

                <th className="px-4 py-3 font-semibold truncate">
                  Created
                </th>

                <th className="px-4 py-3 font-semibold truncate">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-500">
              {courses.map((course) => {
                const status = course.status || (
                  course.isPublished
                    ? 'PUBLISHED'
                    : 'DRAFT'
                );

                const isLoading = actionLoading?.endsWith(course._id);

                return (
                  <tr
                    key={course._id}
                    className="border-b border-gray-500/20"
                  >
                    <td className="md:px-4 pl-2 md:pl-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={course.courseThumbnail} 
                          alt="Course"
                          className="w-16 h-10 object-cover rounded"
                        />

                        <span className="truncate max-w-48 hidden md:block">
                          {course.courseTitle}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {currency}{' '}
                      {Math.floor(
                        course.enrolledStudents.length *
                        (
                          course.coursePrice - 
                          course.discount *
                          course.coursePrice /
                          100
                        )
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {course.enrolledStudents.length}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          statusStyles[status] ||
                          statusStyles.DRAFT
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        course.createdAt
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {status === 'DRAFT' && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              updateCourseStatus(
                                course._id,
                                'publish'
                              )
                            }
                            className="px-3 py-1 rounded bg-green-600 text-white text-xs disabled:opacity-50"
                          >
                            {actionLoading ===
                            `publish-${course._id}`
                              ? 'publishing...'
                              : 'Publish'}
                          </button>
                        )}

                        {status === 'PUBLISHED' && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              updateCourseStatus(
                                course._id,
                                'unpublish'
                              )
                            }
                            className="px-3 py-1 rounded bg-yellow-500 text-white text-xs disabled:opacity-50"
                          >
                            {actionLoading ===
                            `unpublish-${course._id}`
                              ? 'Unpublishing...'
                              : 'Unpublish'}
                          </button>
                        )}

                        {status !== 'ARCHIVED' && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/educator/edit-course/${course._id}`)
                            }
                            className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleArchive(course._id)
                            }
                            className="px-3 py-1 rounded bg-red-600 text-white text-xs disabled:opacity-50"
                          >
                            {actionLoading ===
                            `archive-${course._id}`
                              ? 'Archiving...'
                              : 'Archive'}
                          </button>
                        </>
                        )}

                        {status === 'ARCHIVED' && (
                          <span className="text-xs text-gray-400">
                            Archived
                          </span>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
}

export default MyCourses;