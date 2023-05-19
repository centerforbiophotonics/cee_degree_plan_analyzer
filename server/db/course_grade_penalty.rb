# Given course ratings csv, formulate some course difficulty rating
#

# debug
# include QueryHelper
# usertest = UserCourse.where(:course_digest_id => 236016).first
# course_grade_penalty(usertest)
#
require 'csv'

module CourseGradePenalty

  def self.calculate_ratings(course_digest)
    course_grade_penalty = {:cumulative => [], :singular => []}

    GpaOther.where(
      :subj => course_digest.subj, 
      :crse => course_digest.crse, 
      :term => course_digest.term, 
      :class_id => course_digest.class_id
    ).each do |gpao|
      course_grade_penalty[:cumulative].push(gpao.course_grade - gpao.gpao_cumulative)
      course_grade_penalty[:singular].push(gpao.course_grade - gpao.gpao_singular)
    end

    course_grade_penalty
  end

  def self.bin_data(penalties, bin_size)
    bins_final = []
    bins_sorted = {:cumulative => {}, :singular => {}}

    penalties.each do |type, gpao_list|
      bins_sorted[type] = gpao_list.group_by { |gpao|  
        ap (gpao/bin_size).floor
        gpao_bin = ((gpao/bin_size).floor * bin_size).round(2)
        
        # if gpao_ceil.to_s == "-0.0"
        #   gpao_ceil = 0.0
        # end

       
        "#{gpao_bin} to #{(gpao_bin+bin_size).round(2)}"
      }
      
    end

    (-4.0..(4.0-bin_size)).step(bin_size).each do |e|
      # exclusive range from current step and one step forward, i.e. ( (n)...(n+0.1) )\
      # check if boundary values are being counted twice
      b = e.round(2)
      current_bin_range = "#{b} to #{(b + bin_size).round(2)}"
      cumulative_count = bins_sorted[:cumulative].key?(current_bin_range) ? bins_sorted[:cumulative][current_bin_range].count : 0
      singular_count = bins_sorted[:singular].key?(current_bin_range) ? bins_sorted[:singular][current_bin_range].count : 0
      bins_final << { :bin => current_bin_range, :singular => singular_count, :cumulative => cumulative_count }
    end

    
    bins_final 
  end
  
  #
  # OLD
  #
  # def self.read_csv(data_path="other_gpas.csv")
  #   STDOUT.puts "Opening #{data_path}..." 
  #   STDOUT.flush
  #   course_ratings = {}
  #   total_rows = CSV.read(data_path, {:headers => true})
  #   cur_row = 0
  #   STDOUT.puts "Reading CSV..."
  #   STDOUT.flush
  #   total_rows.each do |row|
  #     key = [row["Course"], row["Term"], row["instructor_pidm"]]
  #     unless course_ratings.has_key?(key)
  #       course_ratings[key] = {gpa_o_diff_list: [], gpa_o_avg: 0.0, gpa_o_std_dev: 0.0, gpa_o_bin: 0, 
  #                             gpa_o_singular_diff_list: [], gpa_o_singular_avg: 0.0, gpa_o_singular_std_dev: 0.0, gpa_o_singular_bin: 0, gpa_list: [], term_gpa: 0.0}
  #     end
  #     # cumulative list
  #     if row["GPA other (Cumulative)"] > row["Course Grade"]
  #       course_ratings[key][:gpa_o_bin] -= 1
  #     elsif row["GPA other (Cumulative)"] < row["Course Grade"]
  #       course_ratings[key][:gpa_o_bin] += 1
  #     # if GPA Other == Course Grade we should not change the rating
  #     end
  #     # singular list
  #     if row["GPA other (Singular Term)"] > row["Course Grade"]
  #       course_ratings[key][:gpa_o_singular_bin] -= 1
  #     elsif row["GPA other (Singular Term)"] < row["Course Grade"]
  #       course_ratings[key][:gpa_o_singular_bin] += 1
  #     end

  #     course_ratings[key][:gpa_list] << row["Course Grade"].to_f
  #     course_ratings[key][:gpa_o_diff_list] << row["Course Grade"].to_f - row["GPA other (Cumulative)"].to_f
  #     course_ratings[key][:gpa_o_singular_diff_list] << row["Course Grade"].to_f - row["GPA other (Singular Term)"].to_f

  #     # Progress Tracker
  #     cur_row += 1
  #     STDOUT.print "\r"
  #     STDOUT.flush
  #     STDOUT.print ((total_rows.length - cur_row).to_s + " of " + total_rows.length.to_s + " rows remaining.")
  #     STDOUT.flush
  #   end

  #   course_ratings.each do |key, value|
  #     course_ratings[key][:term_gpa] = (course_ratings[key][:gpa_list].sum(0.0)) / course_ratings[key][:gpa_list].length
  #     course_ratings[key][:gpa_o_avg] = (course_ratings[key][:gpa_o_diff_list].sum(0.0)) / course_ratings[key][:gpa_o_diff_list].length
  #     course_ratings[key][:gpa_o_singular_avg] = (course_ratings[key][:gpa_o_singular_diff_list].sum(0.0)) / course_ratings[key][:gpa_o_singular_diff_list].length
  #     # calculating for cumulative data
  #     mean_cumulative = course_ratings[key][:gpa_o_avg]
  #     sum_cumulative = course_ratings[key][:gpa_o_diff_list].sum(0.0) { |element| (element - mean_cumulative) ** 2 }
  #     variance_cumulative = sum_cumulative / (course_ratings[key][:gpa_o_diff_list].size - 1)
  #     standard_dev_cumulative = Math.sqrt(variance_cumulative)
  #     course_ratings[key][:gpa_o_std_dev] = standard_dev_cumulative
  #     # calculating for singular data
  #     mean_singular = course_ratings[key][:gpa_o_singular_avg]
  #     sum_singular = course_ratings[key][:gpa_o_singular_diff_list].sum(0.0) { |element| (element - mean_singular) ** 2 }
  #     variance_singular = sum_singular / (course_ratings[key][:gpa_o_singular_diff_list].size - 1)
  #     standard_dev_singular = Math.sqrt(variance_singular)
  #     course_ratings[key][:gpa_o_singular_std_dev] = standard_dev_singular
  #   end
    
  #   write_to_csv(course_ratings, "course_ratings.csv")
  # end

  # def self.write_to_csv(data, path="course_ratings.csv")
  #   total_rows = data.length()
  #   cur_row = 0
  #   STDOUT.print "\r"
  #   STDOUT.puts "Writing to CSV..."
  #   STDOUT.flush
  #   CSV.open(path, "w",
  #     :write_headers => true,
  #     :headers => ["Course", "Term", "Instructor Pidms", "Total Students", "Average Grade", "GPA Other Binary Rating (Cumulative)", "GPA Other Difference Average (Cumulative)", "GPA Other Difference Standard Dev (Cumulative)", "GPA Other Binary Rating (Singular Term)", "GPA Other Difference Average (Singular Term)", "GPA Other Difference Standard Dev (Singular Term)"]
  #   ) do |csv|
  #     data.each do |key, value|
  #       csv << [key[0], key[1], key[2], data[key][:gpa_list].length, data[key][:term_gpa].round(2), data[key][:gpa_o_bin], data[key][:gpa_o_avg].round(2), data[key][:gpa_o_std_dev].round(2), data[key][:gpa_o_singular_bin], data[key][:gpa_o_singular_avg].round(2), data[key][:gpa_o_singular_std_dev].round(2)]
  #       cur_row += 1
  #       STDOUT.print "\r"
  #       STDOUT.flush
  #       STDOUT.print ((total_rows - cur_row).to_s + " of " + total_rows.to_s + " rows remaining.")
  #       STDOUT.flush
  #     end
  #   end
  # end

end
