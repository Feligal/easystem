using EASystem.Models.ExamModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EASystem.Extensions
{
    public static class QuestionShuffler
    {
        //    public static void Shuffle<T>(this Random random, T[] questionArray) {
        //        int n = questionArray.Length;
        //        while (n > 1) {
        //            int k = random.Next(n--);
        //            T temp = questionArray[n];
        //            questionArray[n] = questionArray[k];
        //            questionArray[k] = temp;
        //        }
        //    }
        //}


        public static IEnumerable<T> Shuffle<T>(this IEnumerable<T> source)
        {
            return source.Shuffle(new Random());
        }

        public static IEnumerable<T> Shuffle<T>(this IEnumerable<T> source, Random rng)
        {
            if (source == null) throw new ArgumentNullException("source");
            if (rng == null) throw new ArgumentNullException("rng");

            return source.ShuffleIterator(rng);
        }

        private static IEnumerable<T> ShuffleIterator<T>(
            this IEnumerable<T> source, Random rng)
        {
            var buffer = source.ToList();
            for (int i = 0; i < buffer.Count; i++)
            {
                int j = rng.Next(i, buffer.Count);
                yield return buffer[j];

                buffer[j] = buffer[i];
            }
        }
    }
}
